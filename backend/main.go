package main

import (
    "log"
    "net/http"
    "golang.org/x/net/websocket"
)

func handleWebSocket(ws *websocket.Conn) {
    log.Println("New connection from:", ws.Request().RemoteAddr)
    for {
        var message string
        err := websocket.Message.Receive(ws, &message)
        if err != nil {
            log.Println("Error receiving message:", err)
            break
        }
        log.Println("Received message:", message)
        websocket.Message.Send(ws, message)
    }
}

func main() {
    http.Handle("/ws", websocket.Handler(handleWebSocket))
    
    log.Println("Server starting on :8080")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal("ListenAndServe:", err)
    }
}
