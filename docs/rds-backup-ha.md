# Backup e Alta Disponibilità RDS

Questo progetto utilizza un'istanza AWS RDS PostgreSQL. Per proteggere i dati e mantenere il servizio disponibile, abilita le seguenti funzionalità sull'istanza del database:

## Strategia di backup
- **Backup automatici**: Abilita i backup automatici con un periodo di conservazione di 7 giorni. Questo permette il ripristino point-in-time entro la finestra di conservazione.
- **Snapshot manuali**: Crea snapshot manuali prima di modifiche importanti o rilasci. Gli snapshot possono essere conservati indefinitamente e utilizzati per ripristinare il database o clonare ambienti.
- **Esportazione su S3 (opzionale)**: Usa `aws rds export-task` per esportare i dati degli snapshot su S3 per archiviazione a lungo termine o per la conservazione su altri account.

## Opzioni di alta disponibilità
- **Distribuzione Multi-AZ**: Distribuisci l'istanza RDS con l'opzione Multi-AZ per mantenere una replica sincrona in un'altra Availability Zone. In caso di guasto del nodo primario o manutenzione, RDS effettua automaticamente il failover sulla replica.
- **Replica di lettura**: Per carichi di lavoro con molte letture o per ridondanza tra regioni, crea repliche di lettura. Puoi promuovere una replica a primaria in caso di disaster recovery.
- **Monitoraggio avanzato**: Abilita Amazon CloudWatch e il monitoraggio avanzato per tracciare eventi di failover e lo stato di salute del database.

Adatta queste impostazioni in base ai requisiti di produzione e alle considerazioni sui costi.
