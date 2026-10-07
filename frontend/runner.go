package main

import (
	"log"
	"os"
	"os/exec"
	"time"
)

func main() {
	log.Println("[FRONTEND SUPERVISOR] Initializing PLN Nusa Daya Web Supervisor...")
	for {
		log.Println("[FRONTEND SUPERVISOR] Starting Next.js server (node server.js)...")
		cmd := exec.Command("node", "server.js")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		err := cmd.Run()
		if err != nil {
			log.Printf("[FRONTEND SUPERVISOR] Next.js process exited with error: %v", err)
		} else {
			log.Println("[FRONTEND SUPERVISOR] Next.js process exited normally.")
		}

		log.Println("[FRONTEND SUPERVISOR] Restarting Next.js in 2 seconds...")
		time.Sleep(2 * time.Second)
	}
}
