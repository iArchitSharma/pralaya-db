package main

import (
	"github.com/spf13/cobra"
	"pralaya-db/pkg/backup"
)

func main() {
	var rootCmd = &cobra.Command{Use: "pralaya-db"}

	var backupCmd = &cobra.Command{
		Use: "backup",
		Short: "Create a Database Backup",
		Run: func(cmd *cobra.Command, args []string){
			backup.PerformBackup()
		},
	}

	var restoreCmd = &cobra.Command{
		Use: "restore",
		Short: "Restore a Database",
		Run : func(cmd *cobra.Command, args []string){
			backup.PerformRestore()
		},
	}

	rootCmd.AddCommand(backupCmd, restoreCmd)
    rootCmd.Execute()
}