# 🚀 Deployment della piattaforma

Questa guida descrive i passaggi per effettuare il deploy dell'applicazione **CoWorkSpace** su ambiente di produzione.

## 🏗️ Provisioning infrastruttura
1. Posizionarsi nella cartella `infra/terraform`.
2. Inizializzare il progetto:
   ```bash
   terraform init
   ```
3. Pianificare ed eseguire l'applicazione delle risorse:
   ```bash
   terraform apply
   ```
   Confermare la proposta di piano digitando `yes`.

## 📦 Build e push dell'immagine Docker
1. Costruire l'immagine backend (aggiornare il tag a seconda della release):
   ```bash
   docker build -t registry.example.com/coworkspace/backend:latest ./backend
   ```
2. Effettuare il push sul registry:
   ```bash
   docker push registry.example.com/coworkspace/backend:latest
   ```
3. In alternativa, utilizzare il workflow CI/CD configurato su GitHub Actions che esegue automaticamente build e push ad ogni tag.

## 🔐 Variabili d'ambiente e segreti
Archivia le credenziali in **AWS Systems Manager Parameter Store** o **Secrets Manager** invece di inserirle in chiaro nelle impostazioni di ECS/EC2.

Esempio di creazione di un parametro protetto:

```bash
aws ssm put-parameter \
  --name /coworkspace/JWT_SECRET \
  --value 'supersegreto' \
  --type SecureString
```

Per leggerlo da un'istanza EC2:

```bash
aws ssm get-parameter \
  --name /coworkspace/JWT_SECRET \
  --with-decryption \
  --query 'Parameter.Value' \
  --output text
```

Nella **task definition** ECS usa la sezione `secrets` per collegare Parametri/Secrets alla container definition:

```json
"secrets": [
  { "name": "JWT_SECRET", "valueFrom": "arn:aws:ssm:<REGION>:<ACCOUNT_ID>:parameter/coworkspace/JWT_SECRET" },
  { "name": "DATABASE_URL", "valueFrom": "arn:aws:ssm:<REGION>:<ACCOUNT_ID>:parameter/coworkspace/DATABASE_URL" },
  { "name": "STRIPE_SECRET_KEY", "valueFrom": "arn:aws:secretsmanager:<REGION>:<ACCOUNT_ID>:secret:stripe-key" }
]
```

Variabili richieste:

- `JWT_SECRET`: chiave segreta per la firma dei token.
- `DATABASE_URL`: stringa di connessione al database PostgreSQL.
- `STRIPE_SECRET_KEY`: chiave privata per l'integrazione con Stripe.

In questo modo i valori non vengono mai salvati in chiaro né commitati nel repository.

## 🔁 Roll-back e snapshot RDS
1. Prima di ogni rilascio, creare uno **snapshot manuale** dell'istanza RDS:
   ```bash
   aws rds create-db-snapshot --db-instance-identifier <istanza> --db-snapshot-identifier <snapshot>
   ```
2. In caso di problemi post-deploy:
   - Ripristinare l'istanza dal punto di snapshot:
     ```bash
     aws rds restore-db-instance-from-db-snapshot --db-instance-identifier <nuova-istanza> --db-snapshot-identifier <snapshot>
     ```
   - Aggiornare l'endpoint del database nell'applicazione.
3. Valutare l'uso dei **backup automatici** per il ripristino point-in-time.

Seguendo questi passaggi è possibile eseguire un deploy sicuro e ripristinare rapidamente l'ambiente in caso di necessità.
