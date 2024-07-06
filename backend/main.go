package main

import (
    "log"
    "math/rand"
    "net/http"
    "sync"
    "time"
    "golang.org/x/net/websocket"
)

type Game struct {
    Bombs   []int              `json:"bombs"`
    Clicks  []int              `json:"clicks"`
    Players map[string]*websocket.Conn
    Turn    string             `json:"turn"`
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
            Index   int    `json:"index"`
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
        case "click":
            handleClick(roomID, playerID, msg.Index)
        case "newGame":
            resetGame(roomID)
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

        if len(game.Players) < 2 {
            game.Players[playerID] = ws
            if len(game.Players) == 1 {
                game.Turn = playerID
            }
        } else {
            sendErrorMessage(ws, "Room is full")
            return
        }
    } else {
        games[roomID] = &Game{
            Bombs:   getBombs(),
            Clicks:  []int{},
            Players: map[string]*websocket.Conn{playerID: ws},
            Turn:    playerID,
        }
    }

    broadcastGameState(roomID)
}

func handleClick(roomID, playerID string, index int) {
    gamesMutex.Lock()
    defer gamesMutex.Unlock()

    game, exists := games[roomID]
    if !exists {
        return
    }

    game.mutex.Lock()
    defer game.mutex.Unlock()

    if game.Turn != playerID {
        sendErrorMessage(game.Players[playerID], "Not your turn")
        return
    }

    if !contains(game.Clicks, index) {
        game.Clicks = append(game.Clicks, index)
        // Switch turn
        for pid := range game.Players {
            if pid != playerID {
                game.Turn = pid
                break
            }
        }
    }

    broadcastGameState(roomID)
}

func resetGame(roomID string) {
    gamesMutex.Lock()
    defer gamesMutex.Unlock()

    game, exists := games[roomID]
    if !exists {
        return
    }

    game.mutex.Lock()
    defer game.mutex.Unlock()

    game.Bombs = getBombs()
    game.Clicks = []int{}
    for pid := range game.Players {
        game.Turn = pid
        break
    }

    broadcastGameState(roomID)
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
    } else {
        if game.Turn == playerID {
            for pid := range game.Players {
                game.Turn = pid
                break
            }
        }
        broadcastGameState(roomID)
    }
}

func broadcastGameState(roomID string) {
    game := games[roomID]
    response := struct {
        Type string `json:"type"`
        *Game
    }{
        Type: "gameState",
        Game: game,
    }

    for _, conn := range game.Players {
        websocket.JSON.Send(conn, response)
    }
}

func sendErrorMessage(ws *websocket.Conn, message string) {
    websocket.JSON.Send(ws, struct {
        Type    string `json:"type"`
        Message string `json:"message"`
    }{
        Type:    "error",
        Message: message,
    })
}

func contains(slice []int, item int) bool {
    for _, v := range slice {
        if v == item {
            return true
        }
    }
    return false
}

func getBombs() []int {
    bombs := make([]int, 5)
    for i := range bombs {
        bombs[i] = rand.Intn(25)
    }
    return bombs
}

func main() {
    rand.Seed(time.Now().UnixNano())
    http.Handle("/ws", websocket.Handler(handleWebSocket))
    
    log.Println("Server starting on :8080")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal("ListenAndServe:", err)
    }
}
