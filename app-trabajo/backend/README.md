# Availability API

The AWS Lambda handler checks `PRODUCTO.stock` and `PRODUCTO.estado` in the FOPESA SQL Server database.

## Endpoint

Configure an API Gateway HTTP API route with the Lambda integration:

```text
GET /productos/{idProducto}/disponibilidad?cantidad=1
POST /clientes
POST /pedidos
PATCH /pedidos/{idPedido}/estado
GET /pedidos/{idPedido}?contacto=correo-o-telefono
```

The availability response includes `stock`, `disponible`, `cantidadSolicitada`, and `puedeAtender`. `POST /clientes` accepts `nombre`, `apellido`, `email`, `telefono`, and optional `direccion`; it inserts the customer or updates the row with the same email.

`POST /pedidos` accepts `idCliente`, `items` (`idProducto` and `cantidad`), and `modalidad` (`delivery` or `pickup`). The handler reads prices and delivery costs from SQL Server, checks and reduces stock, and inserts the order and its details in one serializable transaction. If a product is missing or stock is insufficient, it rolls back the complete transaction and returns an error. The database must contain delivery methods named `Delivery` and `Recojo en tienda`, as in `seed_fopesa.sql`.

`PATCH /pedidos/{idPedido}/estado` accepts an `estado` from `Recibido`, `Confirmado`, `Listo`, or `Entregado`, and permits only the next state in that sequence. `GET /pedidos/{idPedido}` returns the order only when `contacto` matches its customer's email or phone. API Gateway must define these methods and paths for the Lambda integration.

## Local API

For local test data, run `backend/seed_fopesa.sql` against a **test database** in SQL Server Management Studio (select the FOPESA database and execute the script), or from PowerShell with `sqlcmd`:

```powershell
sqlcmd -S localhost -d FOPESA -E -i backend/seed_fopesa.sql
```

Change `localhost`, `-E`, or the database name to match your SQL Server setup. The seed uses fixed IDs from the Angular mock catalog and skips rows whose IDs already exist; use a clean test database or inspect those IDs before running it. It gives product `103` zero stock and product `105` one unit so both unavailable and limited-stock behavior can be tested.

Install the ODBC Driver 18 for SQL Server and Python dependencies. In PowerShell, configure the connection string without committing credentials:

```powershell
$env:FOPESA_DB_CONNECTION_STRING = "Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=FOPESA;Trusted_Connection=yes;TrustServerCertificate=yes;"
$env:CORS_ALLOW_ORIGIN = "http://localhost:4200"
py -3 -m pip install -r backend/requirements.txt
py -3 backend/local_server.py
```

Set `FOPESA_DB_CONNECTION_STRING` to the connection string for the actual SQL Server instance. The local server listens on `http://localhost:8000`, which is the Angular development default.

After starting the local API, you can test customer registration from another PowerShell window:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/clientes" -ContentType "application/json" -Body '{"nombre":"Ana Maria","apellido":"Perez Ruiz","email":"ana@example.com","telefono":"999888777","direccion":"Av. Central 123"}'
```

The response contains `idCliente` and `created`. Repeating the same email updates that customer instead of inserting a duplicate.

## Lambda deployment

Set `FOPESA_DB_CONNECTION_STRING` and `CORS_ALLOW_ORIGIN` as Lambda environment variables, configure the handler as `lambda_function.lambda_handler`, and provide `pyodbc` plus the compatible Microsoft ODBC Driver 18 in the Lambda package, layer, or container image. The Lambda must have network access to SQL Server; a local `localhost` database is not reachable from AWS Lambda.

Update the default value of the `INVENTORY_API_URL` token in `src/app/services/inventory.service.ts` to the deployed API Gateway URL before deploying Angular.

## Tests

```powershell
py -3 -m unittest discover -s backend -p "test_*.py"
```