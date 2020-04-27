const { RABBIT_USER, RABBIT_PASS } = process.env
const rabbitConnUrl = `amqp://${RABBIT_USER}:${RABBIT_PASS}@rabbit:5672`
export { rabbitConnUrl }
