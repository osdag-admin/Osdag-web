# Osdag-web Code Review & Testing Checklist (Gemini)

This checklist tracks the step-by-step code review and testing across the 13 segments of the **Osdag-web** codebase (backend, frontend, deployment infrastructure; excluding `osdag_core`).

---

## Review Progress

### Infrastructure & Foundation (Segments 1–4)
- [x] **Segment 1:** Backend Infra, Auth & Database Schema (`backend/config/`, `backend/apps/core/`, `backend/apps/sections/`) — *Completed*
- [x] **Segment 2:** Frontend App Shell & Site Infrastructure (`frontend/src/Auth/`, `homepage/`, `context/`, `constants/`, `components/`, `utils/`, `datasources/`) — *Completed*
- [x] **Segment 3:** Frontend Shared UI Component Library (`frontend/src/modules/shared/components/*`) — *Completed*
- [x] **Segment 4:** Frontend Shared Hooks, Config, Context & Utilities (`frontend/src/modules/shared/{hooks,config,context,utils}`) — *Completed*

### Engineering Module Verticals (Segments 5–12)
- [x] **Segment 5:** Tension Members (`frontend/src/modules/TensionMembers/`, `backend/apps/modules/tension_member/`) — *Completed*
- [ ] **Segment 6:** Compression Members (`frontend/src/modules/compressionMember/`, `backend/apps/modules/compression_member/`)
- [ ] **Segment 7:** Base Plate (`frontend/src/modules/basePlate/`, `backend/apps/modules/base_plate/`)
- [ ] **Segment 8:** Simple Connection: Lap & Butt Joints (`frontend/src/modules/SimpleConnection/`, `backend/apps/modules/simple_connection/`)
- [ ] **Segment 9:** Shear Connection Family (`frontend/src/modules/shearConnection/`, `backend/apps/modules/shear_connection/`)
- [ ] **Segment 10:** Flexural Member: Beams & Plate Girder (`frontend/src/modules/flexuralMember/`, `backend/apps/modules/flexure_member/`)
- [ ] **Segment 11:** Moment Connection: End Plate Family (`frontend/src/modules/beamToColumnEndPlate/`, `beamBeamEndPlate/`, `columnColumnEndPlate/`, `backend/apps/modules/moment_connection/`)
- [ ] **Segment 12:** Moment Connection: Cover Plate Family (`frontend/src/modules/columnColumnCoverPlate...`, `backend/apps/modules/moment_connection/`)

### Operations & Deployment (Segment 13)
- [ ] **Segment 13:** Deployment, Containerization & Testing Infrastructure (`Dockerfile`, `docker-compose*.yml`, `monitoring/`, `load_tests/`, `osdagweb.sh`, `test_*.py`)
