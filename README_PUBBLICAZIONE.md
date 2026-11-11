# Pubblicazione di emanueleguerrini.com su Hostinger

Il repository **MrWine1900/emanueleguerrini.com** contiene il sito HTML/CSS/JavaScript/PHP in italiano e inglese. Il branch di pubblicazione è `main`.

## Collegamento iniziale (da fare una volta)

1. Accedere a **Hostinger → Siti web** e aprire **Gestisci sito** per `emanueleguerrini.com`.
2. Confermare che sia un sito **HTML/PHP personalizzato** collegato al piano Hosting Web; la funzione Git non è disponibile per Hostinger Website Builder.
3. **Prima di distribuire:** eseguire il backup di `public_html` se esistono già file o un sito, perché il deploy può sovrascrivere la destinazione.
4. Aprire **Avanzate → Git → Connetti con GitHub**.
5. Autorizzare la GitHub App Hostinger per il repository **MrWine1900/emanueleguerrini.com**.
6. Scegliere il branch **main**, directory di destinazione **public_html**, quindi cliccare **Deploy**.
7. Dopo il primo deploy, abilitare **Auto-deployment**. I futuri commit su `main` possono aggiornare il sito automaticamente.

## Controlli di lancio

- Aprire `https://emanueleguerrini.com/` e `https://emanueleguerrini.com/en/` e verificare SSL, immagini, navigazione e versione mobile.
- Configurare sul **server** il file `contact-config.php` con un indirizzo reale per ricevere i lead e testare la consegna. Il valore nel repository è intenzionalmente vuoto. Il form risponde 503 finché non è configurato. Evitare di inserire credenziali o email private nel codice pubblico; l'indirizzo del destinatario è un dato di configurazione.
- Verificare che successivi deploy non reimpostino il valore server-side di `contact-config.php`; scegliere un metodo di configurazione persistente.
- Completare informativa privacy e dati professionali/fiscali prima di iniziare a raccogliere richieste reali.
- Verificare i risultati dei test in **GitHub → Actions**.

## Note

Il repository è **pubblico** al momento della creazione. Non contiene segreti; mantenere segreti e credenziali esclusivamente sul server o in un archivio sicuro.
Il deploy è gestito dalla integrazione Git di Hostinger, senza necessità di chiavi SSH in GitHub.

Guida ufficiale Hostinger: https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/
