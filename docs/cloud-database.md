# Database in Cloud su AWS RDS

Questa guida descrive come configurare l'istanza PostgreSQL gestita su **Amazon RDS** per il progetto. Per la struttura dettagliata delle tabelle consultare [database/README-db.md](../database/README-db.md).

## Provisioning dell'istanza

1. **Creazione dell'istanza**: dal pannello RDS scegli `PostgreSQL`, seleziona il piano "Production" e configura dimensioni, storage e credenziali.
2. **Security Group**: crea o associa un security group che consenta l'accesso sulla porta del database (es. `5432`) solo dagli indirizzi IP o dalle VPC autorizzate.
3. **Parameter Group**: personalizza i parametri dell'istanza (es. `max_connections`, `timezone`) tramite un parameter group dedicato e applicalo all'istanza.

## Flussi di migrazione e connection pooling

- **Esecuzione delle migration**: dal backend eseguire `npm run migrate` per applicare gli script nella cartella `database/migrations`.
- **Rollback**: in caso di problemi ripristina lo stato precedente con un rollback delle migration o tramite il ripristino di uno snapshot recente.
- **Connection pooling**: l'applicazione utilizza il `Pool` del pacchetto `pg` per riutilizzare le connessioni e ridurre la latenza verso RDS.

## Alta disponibilità e backup

Per garantire resilienza e protezione dei dati:

- **Alta disponibilità**: abilita la distribuzione **Multi-AZ** o usa repliche di lettura per distribuire il carico e gestire il failover.
- **Backup**: attiva i backup automatici e crea **snapshot** manuali prima delle modifiche critiche.
- **Read Replica**: utilizza repliche di sola lettura per scalare le letture o per scenari di disaster recovery.

Ulteriori dettagli su strategie di backup e opzioni di alta disponibilità sono descritti in [docs/rds-backup-ha.md](./rds-backup-ha.md).
