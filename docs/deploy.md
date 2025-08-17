# 🚀 Deployment della piattaforma

Questa guida descrive i passaggi per effettuare il deploy dell'applicazione **CoWorkSpace** su ambiente di produzione.

## 🏗️ Provisioning infrastruttura
Provisionare manualmente i servizi necessari su AWS tramite CLI:

1. **ECR** – creare il repository delle immagini Docker e autenticarsi:
   ```bash
   aws ecr create-repository --repository-name coworkspace
   aws ecr get-login-password --region <regione> \
     | docker login --username AWS --password-stdin <account>.dkr.ecr.<regione>.amazonaws.com
   ```
2. **S3** – creare un bucket per asset statici o backup:
   ```bash
   aws s3api create-bucket --bucket coworkspace-assets --region <regione> \
     --create-bucket-configuration LocationConstraint=<regione>
   ```
3. **RDS** – avviare l'istanza PostgreSQL:
   ```bash
   aws rds create-db-instance --db-instance-identifier coworkspace-db \
     --engine postgres --master-username <user> --master-user-password <password> \
     --allocated-storage 20 --db-instance-class db.t3.micro
   ```
4. **ECS** – creare il cluster e il servizio:
   ```bash
   aws ecs create-cluster --cluster-name coworkspace
   # registrare una task definition e creare il servizio
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   aws ecs create-service --cluster coworkspace --service-name coworkspace-api \
     --task-definition coworkspace-api --desired-count 1
   ```

## 📦 Build e push dell'immagine Docker
1. Eseguire il login al repository ECR:
   ```bash
   aws ecr get-login-password --region <regione> \
     | docker login --username AWS --password-stdin <account>.dkr.ecr.<regione>.amazonaws.com
   ```
2. Costruire l'immagine backend (aggiornare il tag a seconda della release):
   ```bash
   docker build -t <account>.dkr.ecr.<regione>.amazonaws.com/coworkspace/backend:latest ./backend
   ```
3. Effettuare il push dell'immagine su ECR:
   ```bash
   docker push <account>.dkr.ecr.<regione>.amazonaws.com/coworkspace/backend:latest
   ```
4. In alternativa, utilizzare il workflow CI/CD configurato su GitHub Actions che esegue automaticamente build e push ad ogni tag.

## 🔐 Variabili d'ambiente e segreti
Impostare le variabili necessarie nel servizio di hosting (ad esempio ECS o nei workflow CI/CD) recuperandole da servizi come **AWS Secrets Manager** o **SSM Parameter Store**. Tra le variabili richieste:

- `JWT_SECRET`: chiave segreta per la firma dei token.
- `DATABASE_URL`: stringa di connessione al database PostgreSQL.
- `STRIPE_SECRET_KEY`: chiave privata per l'integrazione con Stripe.

Gestire i valori sensibili tramite i servizi di segreti ed evitare che vengano commitati nel repository.

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
