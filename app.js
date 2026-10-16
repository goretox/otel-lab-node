const express = require('express');
const { trace, SpanStatusCode } = require('@opentelemetry/api');

const app = express();
const PORT = 3000;

// Obtener el tracer de OpenTelemetry
const tracer = trace.getTracer('order-service-tracer');

app.use(express.json());

// Endpoint 1: Auto-instrumentado
app.get('/hello', (req, res) => {
  res.json({ message: '¡Hola desde Node.js instrumentado con OTel!' });
});

// Endpoint 2: Instrumentación Manual con Spans personalizados
app.post('/orders', async (req, res) => {
  const { userId, totalAmount } = req.body;

  return tracer.startActiveSpan('process_payment', async (span) => {
    try {
      // Atributos de negocio agregados al Span
      span.setAttribute('app.user_id', userId || 'guest');
      span.setAttribute('app.payment.total', totalAmount || 0);

      if (!totalAmount || totalAmount <= 0) {
        throw new Error('Monto de la orden inválido');
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      span.setStatus({ code: SpanStatusCode.OK });
      res.status(201).json({ status: 'success', orderId: 'ORD-9921' });
    } catch (error) {
      // Registrar la excepción en la traza
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      res.status(400).json({ status: 'error', message: error.message });
    } finally {
      span.end(); // Cerrar el Span siempre
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor Node.js escuchando en http://localhost:${PORT}`);
});
