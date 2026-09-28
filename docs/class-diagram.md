# Модель даних

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string passwordHash
        +string role
    }
    class Equipment {
        +int id
        +string name
        +string category
        +string inventoryNumber
        +string description
        +string imageUrl
        +string status
    }
    class Rental {
        +int id
        +int userId
        +int equipmentId
        +date requestedAt
        +date dueDate
        +date returnedAt
        +string status
        +string rejectionReason
        +string notes
    }
    User "1" --> "0..*" Rental : подає
    Equipment "1" --> "0..*" Rental : видається за
```

## Обмеження
| Поле | Обмеження |
|---|---|
| User.email | UNIQUE, NOT NULL |
| User.role | CHECK: student, admin |
| Equipment.inventoryNumber | UNIQUE, NOT NULL |
| Equipment.category | CHECK: laptop, camera, sensor, other |
| Equipment.status | CHECK: available, rented, maintenance |
| Rental.status | CHECK: pending, approved, rejected, cancelled, returned |
| Rental.dueDate | CHECK: не раніше requestedAt |
| Rental.userId, equipmentId | FOREIGN KEY, NOT NULL |
| Rental.returnedAt, rejectionReason | можуть бути порожніми (NULL) |