# LexDAO Utils - README

## Overview

Utility modules for the LexDAO example implementation.

## Modules

### Data Validator (`data-validator.ts`)

Comprehensive data validation utilities for:

- DAO proposal validation
- Governance parameter validation
- Member data structure validation
- Vote record validation

## Usage

```typescript
import { DataValidator } from './utils/data-validator';

const validator = new DataValidator();
const result = validator.validateProposal(proposalData);
```text
