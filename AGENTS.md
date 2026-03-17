# Knowledge: Konsulent Frontend JS

## Backend Context

- Backend: Go/Gin + GORM + SQL Server
- Backend repo: `C:\Users\mkk\go\src\github.com\markuskjeldsen\mop-backend-api`
- API base: `/api/v1` or `/api/v2`

## DataTable Selection Patterns

The DataTable component (`src/components/DataTable.vue`) emits two different selection events:

1. `@selection-changed` - Emits **array indices** (legacy behavior)
2. `@selection-ids-changed` - Emits **actual IDs** directly

**Always use `@selection-ids-changed`** for components that need to make API calls with visit IDs. Using `selection-changed` can cause index-to-ID mapping issues when:

- Data is filtered
- Data is paginated
- Data is sorted

## Components Using Each Pattern

| Component            | Event                    | Status     |
| -------------------- | ------------------------ | ---------- |
| NonPlannedVisits.vue | `@selection-ids-changed` | ✅ Fixed   |
| NotVisitedVisits.vue | `@selection-ids-changed` | ✅ Correct |
| ReviewVisits.vue     | `@selection-ids-changed` | ✅ Correct |
| PlannedVisits.vue    | Direct button click      | ✅ Correct |

## Correct Selection Handler Pattern

```js
const handleSelectionChange = (selectedIds) => {
  selectedVisits.value = selectedIds
}
```

## Visit Status IDs

| Status ID | Meaning                                   | Frontend Tab     |
| --------- | ----------------------------------------- | ---------------- |
| 1         | Created (not planned)                     | NonPlannedVisits |
| 2         | Planned                                   | PlannedVisits    |
| 3         | Not visited (letter sent but not visited) | NotVisitedVisits |
| 4         | Reviewed (visited, awaiting review)       | ReviewVisits     |
| 5         | Completed (reviewed)                      | -                |

## API Endpoints

### Visit Endpoints (Frontend → Backend)

| Method | Endpoint                    | Auth  | Description                        |
| ------ | --------------------------- | ----- | ---------------------------------- |
| GET    | `/visits/create`            | Admin | Get created (unplanned) visits     |
| GET    | `/visits/planned`           | Admin | Get planned visits grouped by user |
| GET    | `/visits/byStatus?status=X` | Admin | Get visits by status ID            |
| GET    | `/visits/byId?id=X`         | User  | Get single visit by ID             |
| POST   | `/visits/create`            | Admin | Create new visits                  |
| POST   | `/visits/plan`              | Admin | Upload Excel to plan visits        |
| POST   | `/visits/visitfile`         | Admin | Generate Excel for planning        |
| PATCH  | `/visits/planned/:id`       | Admin | Update planned visit               |
| DELETE | `/visit/byId?id=X`          | Admin | Delete visit                       |
| POST   | `/visit/letterSent?id=X`    | Admin | Mark visit as sent (status 3)      |
| POST   | `/visit/reviewed`           | Admin | Move visits to status 5            |
| GET    | `/visit/pdf?id=X`           | Admin | Get PDF for visit                  |

### Other Endpoints

| Method | Endpoint                 | Auth   | Description           |
| ------ | ------------------------ | ------ | --------------------- |
| GET    | `/users`                 | Admin  | Get all users         |
| GET    | `/visits/types`          | Public | Get visit types       |
| POST   | `/login`                 | Public | User login            |
| POST   | `/visit-response/create` | User   | Create visit response |

## Data Models (Backend)

### Visit Model (key fields)

```go
type Visit struct {
    ID            uint         // Primary key - USE THIS for API calls
    UserID        uint         // Assigned consultant
    Address       string       // Full address
    Sagsnr        uint         // Case number
    Stopnr        uint         // Stop order in route
    VisitDate     time.Time    // Planned date
    VisitTime     string       // Arrival time
    VisitInterval string       // Time window
    StatusID      uint         // 1-5 (see above)
    TypeID        uint         // Visit type
    Debitors      []Debitor    // Many2many relation
    VisitResponse *VisitResponse // If visited
}
```

### Important: ID vs Sagsnr

- `ID` = Primary key in database, used for ALL API operations
- `Sagsnr` = Case number from external system (Advopro)

## Required Headers

- Authentication: `Authorization: Bearer <token>`
- Content-Type: `application/json` (or `multipart/form-data` for file uploads)

## DataTable Selection Programmatic Control

The DataTable component does NOT support v-model for selections - selections are managed internally via refs. To clear selections programmatically:

1. Add a `ref` to the DataTable in the parent component
2. Add a `clearSelection` method to DataTable.vue and expose it via `defineExpose`
3. Call `dataTableRef.value.clearSelection()` from the parent

```js
// DataTable.vue
const clearSelection = () => {
  selectedItems.value = []
  selectedVisitIds.value = []
}

defineExpose({
  clearSelection,
})

// Parent component
const dataTableRef = ref(null)
// After some action:
dataTableRef.value?.clearSelection()
```
