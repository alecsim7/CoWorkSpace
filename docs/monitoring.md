# Monitoraggio

Questo documento descrive la configurazione di CloudWatch per CoWorkSpace.

## Allarmi CloudWatch
- **CPUUtilization**: allarme quando l'utilizzo medio della CPU supera il 70% per 5 minuti.
- **DatabaseConnections**: allarme se le connessioni RDS si avvicinano al massimo configurato.
- **Latency**: allarme in caso di latenza HTTP elevata per il backend.

## Auto Scaling
Il gruppo Auto Scaling utilizza l'allarme CPUUtilization per scalare:
- **Scale out** quando la CPU > 70% per 5 minuti.
- **Scale in** quando la CPU < 30% per 10 minuti.

## Dashboard
Le dashboard di CloudWatch forniscono grafici per il conteggio delle richieste, i tassi di errore e l'utilizzo delle risorse.

## Log
I log dell'applicazione vengono inviati a CloudWatch Logs per la conservazione centralizzata e l'analisi.
=======
# Monitoraggio e Scalabilità

## Scalabilità del Backend
- Distribuisci il backend utilizzando AWS Elastic Beanstalk o un gruppo Auto Scaling EC2.
- Configura le policy di scaling in base a:
  - **Utilizzo CPU**: scala verso l'alto quando l'utilizzo medio della CPU è elevato e verso il basso quando diminuisce.
  - **Conteggio richieste per target**: scala verso l'alto quando il tasso di richieste per istanza supera la soglia definita.

## Log e Allarmi CloudWatch
- Invia stdout e stderr di `node server.js` a **CloudWatch Logs**.
- Crea filtri di metrica e allarmi per:
  - **Alto tasso di errore**: attiva quando le voci di log con livello `error` superano una soglia.
  - **Alta latenza**: attiva quando la latenza dell'applicazione supera un valore definito.

## Monitoraggio RDS
- Abilita le **metriche CloudWatch** per l'istanza RDS.
- Imposta allarmi sulle metriche chiave come:
  - **CPUUtilization**: allarme quando l'utilizzo della CPU supera la soglia.
  - **DatabaseConnections**: allarme quando le connessioni attive si avvicinano al limite dell'istanza.
