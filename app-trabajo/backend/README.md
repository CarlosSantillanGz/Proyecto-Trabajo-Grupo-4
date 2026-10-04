# Availability API

The AWS Lambda handler checks `PRODUCTO.stock` and `PRODUCTO.estado` in the FOPESA SQL Server database.

## Endpoint

Configure an API Gateway HTTP API route with the Lambda integration:

```text
GET /productos/{idProducto}/disponibilidad?cantidad=1
POST /clientes
```

The availability response includes `stock`, `disponible`, `cantidadSolicitada`, and `puedeAtender`. `POST /clientes` accepts `nombre`, `apellido`, `email`, `telefono`, and optional `direccion`; it inserts the customer or updates the row with the same email. The handler is read-only for inventory; the order-creation flow must check stock again transactionally before reducing inventory to avoid overselling when concurrent requests occur.

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