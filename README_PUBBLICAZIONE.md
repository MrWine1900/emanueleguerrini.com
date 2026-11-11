# Pubblicazione emanueleguerrini.com su Hostinger via GitHub

## Perche questa versione
Questo repository contiene le pagine HTML, CSS, JavaScript e PHP del sito personale. Nessuna password o chiave SSH e richiesta in GitHub: Hostinger supporta la connessione GitHub via OAuth.

## 1. Repository GitHub
Creare un repository **privato** `emanueleguerrini-site` sull’account GitHub `MrWine1900`. Caricare i file e le cartelle qui presenti nella root del repository (non il file ZIP). Branch `main`.

## 2. Hostinger
Accedere a Hostinger > Siti web > Gestisci sito > Avanzate > Git > Connetti con GitHub. Autorizzare il repository `MrWine1900/emanueleguerrini-site`, selezionare `main` e directory `public_html`. Verificare il sito e attivare Auto-deployment.

## 3. Prima del lancio
- Fare backup dell'eventuale sito già presente in `public_html`.
- Controllare che il dominio punti allo spazio Hosting Web corretto e che HTTPS sia attivo.
- Configurare l'indirizzo di ricezione nel file `contact-config.php` nella root del sito, senza inserire segreti nel repo, poi testare realmente l'invio del modulo. Il form attualmente restituisce errore 503 se non configurato.
- Revisionare le pagine Privacy e i dati obbligatori.
- Verificare https://emanueleguerrini.com/ e https://emanueleguerrini.com/en/ da smartphone e desktop.

## Note
Lo script di controllo automatico in `.github/workflows/quality.yml` controlla HTML, JS e PHP. Il vecchio workflow SSH e stato rimosso perche il deploy viene gestito nativamente da Hostinger Git: evita segreti SSH non necessari.
Riferimento ufficiale: https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/
