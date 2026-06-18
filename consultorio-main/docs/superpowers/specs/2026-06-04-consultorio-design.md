# Consultório Médico Missionário — Design Spec

**Data:** 2026-06-04  
**Status:** Aprovado para implementação  

---

## 1. Visão Geral

Sistema web para clínico geral que atende missionários da Igreja de Jesus Cristo dos Santos dos Últimos Dias. O médico cobre 2–3 missões (inicialmente SP Norte, SP Sul, SP Leste) e precisa centralizar agendamento, histórico médico e acompanhamento — substituindo a combinação atual de papel, planilhas e WhatsApp.

O sistema é de uso **solo** (somente o médico), responsivo (celular e desktop), e hospedado inteiramente em infraestrutura gratuita.

---

## 2. Usuários

| Papel | Descrição | Acesso |
|---|---|---|
| Médico | Usuário principal. Único com login. | Total |
| *(V2)* Esposas de presidentes | Consultam status de saúde de missionários da missão delas | Leitura limitada por missão |

---

## 3. Escopo do MVP

### Dentro do escopo
- Cadastro e perfil de missionários
- Registro de consultas com histórico completo
- Agendamento de consultas
- Dashboard com visão do dia
- Login seguro do médico

### Fora do escopo (V2)
- Emissão de receitas médicas em PDF
- Relatórios de saúde por missão para presidências
- Acesso de esposas de presidentes
- Notificações / lembretes de consulta
- Integração com WhatsApp

---

## 4. Stack Técnica

| Camada | Tecnologia | Custo |
|---|---|---|
| Frontend + Backend | Next.js 15 (App Router) | Gratuito |
| Hospedagem | Vercel (free tier) | Gratuito |
| Banco de dados | Supabase PostgreSQL (free tier) | Gratuito — 500 MB |
| Autenticação | Supabase Auth (email + senha) | Gratuito |
| Estilo | Tailwind CSS | Gratuito |

**Limite prático do free tier:** 500 MB de banco é mais do que suficiente para centenas de missionários e anos de histórico de consultas. O free tier do Vercel suporta tráfego ilimitado para projetos pessoais.

---

## 5. Modelo de Dados

### `missions` — Missões
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | Ex: "Missão Brasil São Paulo Norte" |
| short_name | text | Ex: "SP Norte" |
| created_at | timestamp | |

### `missionaries` — Missionários (pacientes)
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| full_name | text | |
| preferred_name | text | Ex: "Elder Johnson" |
| birthdate | date | |
| country_of_origin | text | |
| mission_id | uuid FK → missions | Missão atual |
| current_area | text | Área/cidade atual |
| companion_name | text | Nome do companheiro atual |
| mission_start_date | date | |
| mission_expected_end | date | |
| phone | text | |
| emergency_contact_name | text | Nome do familiar |
| emergency_contact_phone | text | |
| blood_type | text | Ex: "O+" |
| allergies | text | Texto livre — alerta no formulário de consulta |
| chronic_conditions | text | Texto livre |
| notes | text | Observações gerais |
| status | enum | active / transferred / released / medical_leave |
| created_at | timestamp | |

> **Decisão importante:** `mission_id` reflete a missão *atual* do missionário. O histórico de consultas não é apagado quando ele é transferido — segue vinculado ao mesmo `missionary_id`.

### `appointments` — Agendamentos
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| missionary_id | uuid FK → missionaries | |
| scheduled_at | timestamptz | Data e hora da consulta |
| reason | text | Motivo / queixa esperada |
| status | enum | scheduled / confirmed / completed / cancelled / no_show |
| notes | text | Observações do agendamento |
| created_at | timestamp | |

### `consultations` — Consultas realizadas
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| missionary_id | uuid FK → missionaries | |
| appointment_id | uuid FK → appointments | Nullable — consultas sem agendamento prévio |
| consulted_at | timestamptz | Data e hora real da consulta |
| chief_complaint | text | Queixa principal |
| vital_bp | text | Pressão arterial (ex: "120/80") |
| vital_temp | numeric | Temperatura em °C |
| vital_hr | integer | Freq. cardíaca em bpm |
| vital_spo2 | integer | SpO2 em % |
| vital_weight | numeric | Peso em kg |
| clinical_notes | text | Anamnese e exame físico |
| diagnosis | text | Diagnóstico em texto livre |
| cid10 | text | Código CID-10 (opcional) |
| treatment | text | Medicações e conduta |
| follow_up_date | date | Data de retorno (opcional) |
| status | enum | resolved / follow_up / referral |
| created_at | timestamp | |

---

## 6. Telas do MVP

### 6.1 Dashboard
- Saudação com data atual
- 4 métricas: consultas hoje, total de missionários ativos, consultas na semana, missões ativas
- Lista de agendamentos do dia com horário, nome, missão e status
- Busca rápida de missionário (mobile)
- Botão "Nova Consulta"

### 6.2 Missionários
**Lista:**
- Busca por nome em tempo real
- Filtro por missão (chips)
- Card por missionário com nome, idade, país, missão e chip de status de saúde (Saudável / Acompanhamento / Alergia)
  - Status é **derivado**: se `allergies` preenchido → "Alergia"; se última consulta com `status = follow_up` → "Acompanhamento"; caso contrário → "Saudável"

**Perfil:**
- Cabeçalho com dados pessoais e missão atual
- Bloco de dados da missão (chegada, previsão de término, companheiro)
- Bloco de info médica (tipo sanguíneo, alergias, condições crônicas, contato de emergência)
- Histórico de consultas em ordem cronológica reversa
- Botão "Nova Consulta" sempre visível

### 6.3 Nova Consulta
- Missionário pré-selecionável ou buscável
- Alerta visível de alergias no topo do formulário
- Data/hora auto-preenchida (editável)
- Sinais vitais opcionais (PA, temp, FC, SpO2, peso)
- Queixa principal (texto livre)
- Diagnóstico + CID-10 opcional
- Tratamento/medicação (texto livre)
- Anotações clínicas
- Data de retorno + status (Resolvido / Acompanhamento / Encaminhamento)

### 6.4 Agenda
**Mobile:** tira semanal + lista de horários do dia selecionado  
**Desktop:** mini-calendário mensal com filtro por missão + visão de linha do tempo do dia  
- Indicadores visuais de dias com consultas
- Cores por missão consistentes em todo o sistema
- Status por consulta: Confirmado / Pendente / Aguardando / Cancelado
- Criação de agendamento com busca de missionário + horário + motivo

---

## 7. Decisões de Design

- **Histórico segue o missionário, não a missão.** Transferências não apagam nem desvinculam consultas anteriores.
- **Sinais vitais são opcionais.** O médico pode registrar uma consulta rapidamente sem preencher tudo.
- **CID-10 é opcional.** Facilita consultas rápidas sem travar no código.
- **Alergias sempre visíveis** no formulário de nova consulta para evitar erro de prescrição.
- **Cores por missão** (roxo/verde/azul) são consistentes em toda a interface.
- **Sem complexidade de permissões no MVP.** Um único login de médico, sem papéis ou acessos diferenciados.
- **Mobile-first.** O médico usa celular durante consultas; desktop é complementar.

---

## 8. Fora do Escopo — Detalhes V2

| Funcionalidade | Por que foi adiada |
|---|---|
| Receitas médicas (PDF) | Requer template, assinatura digital; escopo grande |
| Relatórios para presidências | Requer definição de formato + acesso externo |
| Acesso para esposas de presidentes | Requer sistema de papéis e autenticação multi-usuário |
| Notificações de retorno | Requer integração com e-mail/SMS/WhatsApp |
| Encaminhamentos para especialistas | Requer formulário adicional e rastreamento |
