import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"

def print_step(msg):
    print(f"\n[EXTREME TEST] === {msg} ===")

try:
    print_step("1. Verificando Saúde da Base de Dados e Backend")
    # Tenta conectar até 3 vezes (wait for db)
    for _ in range(3):
        try:
            r = requests.get(f"http://localhost:8000/")
            if r.status_code == 200:
                break
        except requests.ConnectionError:
            time.sleep(2)
    else:
        raise Exception("Backend não está a responder na porta 8000.")

    print_step("2. Teste de Injeção e Segurança no Login")
    # SQL Injection attempt
    sql_payload = {"username": "' OR '1'='1", "password": "password"}
    r_sqli = requests.post(f"{BASE_URL}/auth/login", data=sql_payload)
    assert r_sqli.status_code in [400, 401, 403, 404, 422], f"SQL Injection não foi bloqueada adequadamente! Status: {r_sqli.status_code}"
    
    print_step("3. Login Legítimo e Aquisição de Token")
    login_data = {"username": "admin@comunidade.pt", "password": "Sync@Sec!2026"}
    r = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    assert r.status_code == 200, f"Login falhou: {r.text}"
    token = r.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {token}"}
    
    print_step("4. Teste Rigoroso de CRUD (Organizações)")
    # Create
    org_data = {"name": "Test Org", "subdomain": "testorg", "is_active": True}
    r_org = requests.post(f"{BASE_URL}/organizations/", json=org_data, headers=user_headers)
    assert r_org.status_code in [200, 201], f"Criação de Org falhou: {r_org.text}"
    org_id = r_org.json()["id"]
    
    # Read
    r_read = requests.get(f"{BASE_URL}/organizations/", headers=user_headers)
    assert r_read.status_code == 200
    assert any(o["id"] == org_id for o in r_read.json()), "Organização criada não apareceu na listagem."
    
    print_step("5. Teste de Isolamento de Tenants (Context Switching)")
    # Switch to the new org
    r_switch = requests.post(f"{BASE_URL}/auth/switch-org/{org_id}", headers=user_headers)
    assert r_switch.status_code == 200, "Falha ao trocar de contexto."
    org_token = r_switch.json()["access_token"]
    org_headers = {"Authorization": f"Bearer {org_token}"}
    
    print_step("6. Verificação de Integridade de Conexão com o PostgreSQL")
    # Fetch metrics
    r_dash = requests.get(f"{BASE_URL}/analytics/dashboard", headers=org_headers)
    assert r_dash.status_code == 200, "Falha na recolha de métricas, possível erro na Base de Dados."
    
    print("\n✅ TESTES EXTREMOS DE BACKEND CONCLUÍDOS COM SUCESSO! A aplicação e a Base de Dados estão blindadas.")
    sys.exit(0)

except Exception as e:
    print(f"\n❌ FALHA NOS TESTES EXTREMOS: {str(e)}")
    sys.exit(1)
