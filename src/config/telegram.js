const fetch = require('node-fetch')

const send = (text) => {
    const body = {
        token: '5806553287:AAFtDgYzUWMgJvO-Slotz19GyQEPxYa4SHg',
        id: '128348430',
        text
    }

    fetch(process.env.TELEGRAM_NOTIFY_API, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    })
        .catch(console.error)
}


module.exports = {
    send
}