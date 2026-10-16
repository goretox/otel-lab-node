const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');

// Configurar el exportador OTLP enviando trazas al OTel Collector (LAB 1)
const traceExporter = new OTLPTraceExporter({
  url: 'grpc://localhost:4317',
});

// Inicializar el SDK de Node.js con auto-instrumentación
const sdk = new NodeSDK({
  serviceName: 'order-service-node',
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Arrancar el SDK
sdk.start();

// Cierre limpio al detener el proceso
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OTel SDK finalizado correctamente'))
    .catch((err) => console.log('Error finalizando OTel SDK', err))
    .finally(() => process.exit(0));
});
