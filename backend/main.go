// main.go
package main

import (
    "log"
    "net/http"
    "sync"
    "golang.org/x/net/websocket"
)

type Game struct {
    Players map[string]*websocket.Conn
    mutex   sync.Mutex
}

var games = make(map[string]*Game)
var gamesMutex sync.Mutex

func handleWebSocket(ws *websocket.Conn) {
    log.Println("New connection from:", ws.Request().RemoteAddr)

    var playerID string
    var roomID string

    for {
        var msg struct {
            Type    string `json:"type"`
            RoomID  string `json:"roomId"`
            PlayerID string `json:"playerId"`
        }
        err := websocket.JSON.Receive(ws, &msg)
        if err != nil {
            log.Println("Error receiving message:", err)
            break
        }

        switch msg.Type {
        case "join":
            roomID = msg.RoomID
            playerID = msg.PlayerID
            joinGame(roomID, playerID, ws)
        default:
            log.Println("Unknown message type:", msg.Type)
        }
    }

    if roomID != "" {
        leaveGame(roomID, playerID)
    }
}

func joinGame(roomID, playerID string, ws *websocket.Conn) {
    gamesMutex.Lock()
    defer gamesMutex.Unlock()

    if game, exists := games[roomID]; exists {
        game.mutex.Lock()
        defer game.mutex.Unlock()
        game.Players[playerID] = ws
    } else {
        games[roomID] = &Game{
            Players: map[string]*websocket.Conn{playerID: ws},
        }
    }
}

func leaveGame(roomID, playerID string) {
    gamesMutex.Lock()
    defer gamesMutex.Unlock()

    game, exists := games[roomID]
    if !exists {
        return
    }

    game.mutex.Lock()
    defer game.mutex.Unlock()

    delete(game.Players, playerID)
    if len(game.Players) == 0 {
        delete(games, roomID)
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
