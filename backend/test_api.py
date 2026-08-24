import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login
print("== 1. Realizando Login ==")
login_data = {"username": "admin4@comunidade.pt", "password": "adminpassword"}
r = requests.post(f"{BASE_URL}/auth/login", data=login_data)
r.raise_for_status()
token = r.json()["access_token"]
user_headers = {"Authorization": f"Bearer {token}"}
print(f"Token adquirido com sucesso!")

# 2. Add Organization
print("\n== 2. Criando Organização ==")
org_data = {
    "name": "Nova Ordem de Fenix",
    "subdomain": "fenix",
    "is_active": True
}
r_org = requests.post(f"{BASE_URL}/organizations/", json=org_data, headers=user_headers)
r_org.raise_for_status()
org = r_org.json()
org_id = org["id"]
print(f"Organização '{org['name']}' criada com ID: {org_id}")

# 3. Request Context Token
print("\n== 3. Trocando de Organização (Pegando Token de Contexto) ==")
r_switch = requests.post(f"{BASE_URL}/auth/switch-org/{org_id}", headers=user_headers)
r_switch.raise_for_status()
org_token = r_switch.json()["access_token"]
org_headers = {"Authorization": f"Bearer {org_token}"}
print(f"Token de Contexto adquirido com sucesso!")

# 4. Create Announcement
print("\n== 4. Criando Anúncio ==")
announcement_data = {
    "title": "Bem-vindos à Nova Ordem",
    "content": "A plataforma agora integra os testes automatizados E2E.",
    "is_active": True
}
r_announcement = requests.post(f"{BASE_URL}/communication/announcements", json=announcement_data, headers=org_headers)
r_announcement.raise_for_status()
print(f"Anúncio criado: {r_announcement.json()['title']}")

# 5. Dashboard Metrics Check
print("\n== 5. Checando Métricas do Dashboard ==")
r_dash = requests.get(f"{BASE_URL}/analytics/dashboard", headers=org_headers)
r_dash.raise_for_status()
print(json.dumps(r_dash.json(), indent=2))

print("\n--- TESTE CONCLUÍDO COM SUCESSO ---")
