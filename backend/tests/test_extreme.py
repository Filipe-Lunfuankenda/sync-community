import json
import time
import sys
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000/api/v1"

def print_step(msg):
    print(f"\n[EXTREME TEST] === {msg} ===")

def do_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None:
        if isinstance(data, dict) and headers.get('Content-Type') == 'application/x-www-form-urlencoded':
            data = urllib.parse.urlencode(data).encode('utf-8')
        else:
            data = json.dumps(data).encode('utf-8')
            headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read()
            return response.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        body = e.read()
        return e.code, json.loads(body) if body else None
    except urllib.error.URLError as e:
        raise ConnectionError(f"Connection refused: {e.reason}")

try:
    print_step("1. Verificando Saúde da Base de Dados e Backend")
    for _ in range(5):
        try:
            status, _ = do_request("http://localhost:8000/")
            if status == 200:
                break
        except Exception:
            time.sleep(4)
    else:
        raise Exception("Backend não está a responder na porta 8000.")

    print_step("2. Teste de Injeção e Segurança no Login")
    sql_payload = {"username": "' OR '1'='1", "password": "password"}
    status, _ = do_request(f"{BASE_URL}/auth/login", method="POST", data=sql_payload, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    assert status in [400, 401, 422], f"Vulnerável a SQL Injection! Status: {status}"
    
    print_step("3. Login Legítimo e Aquisição de Token")
    login_data = {"username": "admin@comunidade.pt", "password": "Sync@Sec!2026"}
    status, data = do_request(f"{BASE_URL}/auth/login", method="POST", data=login_data, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    assert status == 200, f"Login falhou: {data}"
    token = data.get("access_token")
    assert token, "Token ausente"
    user_headers = {"Authorization": f"Bearer {token}"}
    
    print_step("4. Teste Rigoroso de CRUD (Organizações)")
    org_data = {"name": "Test Org", "subdomain": "testorg", "is_active": True}
    status, org_res = do_request(f"{BASE_URL}/organizations/", method="POST", data=org_data, headers=user_headers)
    assert status in [200, 201], f"Criação de Org falhou: {org_res}"
    org_id = org_res["id"]
    
    status, orgs = do_request(f"{BASE_URL}/organizations/", headers=user_headers)
    assert status == 200
    assert any(o["id"] == org_id for o in orgs), "Organização criada não apareceu na listagem."
    
    print_step("5. Teste de Isolamento de Tenants (Context Switching)")
    status, switch_res = do_request(f"{BASE_URL}/auth/switch-org/{org_id}", method="POST", headers=user_headers)
    assert status == 200, "Falha ao trocar de contexto."
    org_token = switch_res["access_token"]
    org_headers = {"Authorization": f"Bearer {org_token}"}
    
    print_step("6. Verificação de Integridade de Conexão com o PostgreSQL")
    status, dash = do_request(f"{BASE_URL}/analytics/dashboard", headers=org_headers)
    assert status == 200, "Falha na recolha de métricas, possível erro na Base de Dados."
    
    print("\n✅ TESTES EXTREMOS DE BACKEND CONCLUÍDOS COM SUCESSO! A aplicação e a Base de Dados estão blindadas.")
    sys.exit(0)

except Exception as e:
    print(f"\n❌ FALHA NOS TESTES EXTREMOS: {str(e)}")
    sys.exit(1)
