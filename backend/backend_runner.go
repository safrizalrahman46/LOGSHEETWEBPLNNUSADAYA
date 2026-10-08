package main

import (
	"log"
	"os"
	"os/exec"
	"time"
)

func main() {
	log.Println("[BACKEND SUPERVISOR] Initializing PLN Nusa Daya Backend Supervisor...")
	for {
		log.Println("[BACKEND SUPERVISOR] Starting Go Fiber backend (server.exe)...")
		cmd := exec.Command(".\\server.exe")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		err := cmd.Run()
		if err != nil {
			log.Printf("[BACKEND SUPERVISOR] Backend process exited with error: %v", err)
		} else {
			log.Println("[BACKEND SUPERVISOR] Backend process exited normally.")
		}

		log.Println("[BACKEND SUPERVISOR] Restarting Backend in 2 seconds...")
		time.Sleep(2 * time.Second)
	}
}
