import * as amqp from 'amqplib/callback_api'
let DB: { [key: string]: string } = {}
let rabbConn: amqp.Connection
function start() {
        amqp.connect('amqp://rabbitmq:rabbitmq@rabbit1:5672', (err, conn) => {
            if (err) {
                console.log('Connection failed. Reconnect in 1000ms');


                setTimeout(() => {
                    start()
                }, 1000);
                return
            }
            console.log('Connected');

            rabbConn = conn
            createChannels()
        })
   
    function createChannels() {
        if (!rabbConn) {
            throw new Error('no Rabbit connection')
        }

        createAddChannel()
        createEditChannel()
        createDeleteChannel()

        createProgressChannel()
        createSnapshotChannel()

        createErrorChannel()

    }
    function createAddChannel() {
        const name = 'add'
        rabbConn.createChannel((err, chnl) => {
            if (err) {
                throw err
            }

            chnl.assertQueue(name, {
                durable: false
            });
            chnl.consume(name, (msg) => {
                let parsedMsg
                try {
                    parsedMsg = JSON.parse(msg.content.toString())
                } catch (error) {
                    chnl.sendToQueue('error', Buffer.from(error.toString()))
                    return
                }

                if (!parsedMsg.key || !parsedMsg.value) {
                    chnl.sendToQueue('error', Buffer.from('Invalid Keys'))
                } else if (DB[parsedMsg.key]) {
                    chnl.sendToQueue('error', Buffer.from(`${parsedMsg.key} already exist`))
                }
                else {
                    DB = { ...DB, [parsedMsg.key]: parsedMsg.value }
                    chnl.sendToQueue('snapshot', Buffer.from(JSON.stringify(DB)))
                    chnl.sendToQueue('progress', Buffer.from(`adding ${parsedMsg.key} with value ${parsedMsg.value}`))
                }
                console.log(DB);
            }, { noAck: true })
        })
    }
    function createEditChannel() {
        const name = 'edit'
        rabbConn.createChannel((err, chnl) => {
            if (err) {
                throw err
            }
            chnl.assertQueue(name, {
                durable: false
            });
            chnl.consume(name, (msg) => {
                let parsedMsg
                try {
                    parsedMsg = JSON.parse(msg.content.toString())
                } catch (error) {
                    chnl.sendToQueue('error', Buffer.from(error.toString()))
                    return
                }
                if (!parsedMsg.key || !parsedMsg.value) {
                    chnl.sendToQueue('error', Buffer.from('Invalid Keys'))
                } else {
                    DB = { ...DB, [parsedMsg.key]: parsedMsg.value }
                    chnl.sendToQueue('snapshot', Buffer.from(JSON.stringify(DB)))
                    chnl.sendToQueue('progress', Buffer.from(`change ${parsedMsg.key} with value ${parsedMsg.value}`))
                }
                console.log(" [x] Received %s", msg.content.toString());
            })
        })
    }
    function createDeleteChannel() {
        const name = 'delete'
        rabbConn.createChannel((err, chnl) => {
            if (err) {
                throw err
            }
            chnl.assertQueue(name, {
                durable: false
            });
            chnl.consume(name, (msg) => {
                let parsedMsg
                try {
                    parsedMsg = JSON.parse(msg.content.toString())
                } catch (error) {
                    chnl.sendToQueue('error', Buffer.from(error.toString()))
                    return
                }
                if (!parsedMsg.key) {
                    chnl.sendToQueue('error', Buffer.from('Invalid Keys'))
                } else {
                    console.log('delete', DB);
                    delete DB[parsedMsg.key]
                    console.log('delete', DB);

                    chnl.sendToQueue('snapshot', Buffer.from(JSON.stringify(DB)))
                    chnl.sendToQueue('progress', Buffer.from(`delete ${parsedMsg.key}`))
                }
            }, {
                noAck: true
            })
        })
    }
    function createErrorChannel() {
        const name = 'error'
        rabbConn.createChannel((err, chnl) => {
            if (err) {
                throw err
            }

            chnl.assertQueue(name, {
                durable: false
            });
            chnl.consume(name, (msg) => {
                let parsedMsg
                try {
                    parsedMsg = JSON.parse(msg.content.toString())
                } catch (error) {
                    chnl.sendToQueue('error', Buffer.from(error.toString()))
                    return
                }
                if (!parsedMsg.key || !parsedMsg.value) {
                    chnl.sendToQueue('error', Buffer.from('Invalid Keys'))
                } else {
                    chnl.sendToQueue('snapshot', Buffer.from(JSON.stringify(DB)))
                    chnl.sendToQueue('progress', Buffer.from(`edit ${parsedMsg.key} with value ${parsedMsg.value}`))
                }
            }, {
                noAck: true
            })
        })
    }
    function createSnapshotChannel() {
        const name = 'snapshot'
        rabbConn.createChannel((err, chnl) => {
            if (err) {
                throw err
            }
            chnl.assertQueue(name, {
                durable: false
            });

        })
    }
    function createProgressChannel() {
        const name = 'progress'
        rabbConn.createChannel((err, chnl) => {
            if (err) {
                throw err
            }
            chnl.assertQueue(name, {
                durable: false
            });

        })
    }
}

start()



