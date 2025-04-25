## Using the Tool of Thought Notation: Examples and Guides

This section provides practical examples and guides on how to use the APL-like notation presented in this document. The goal is to illustrate its power for expressing complex operations concisely, particularly in the context of array manipulation, data analysis, and algorithmic thinking.

We use `←` for assignment (like `=` in many programming languages) and `←→` to show the result of an expression. `⍵` represents the right argument to a function (or the only argument for monadic functions), and `⍺` represents the left argument (for dyadic functions).

### 1. Core Idea: Thinking in Arrays

The fundamental principle is operating on entire arrays (vectors, matrices, higher-dimensional structures) simultaneously, rather than element by element using loops.

**Example:** Add 10 to every element in a list.

*   **Traditional:** `for i in list: result[i] = list[i] + 10`
*   **Notation:** `list ← 1 2 3 4 5` <br> `result ← list + 10` <br> `result` ←→ `11 12 13 14 15`

Scalar functions like `+`, `-`, `×`, `÷`, `*`, `⌈`, `⌊`, etc., automatically apply element-wise to arrays.

### 2. Creating and Shaping Arrays

Common tasks involve generating sequences and structuring data.

**Example Variables:**
*   `v` ← `2 3 5` (A vector)
*   `m` ← `2 3 ⍴ ⍳6` (A 2x3 matrix: `1 2 3` on row 1, `4 5 6` on row 2)
    *   `⍳6` generates `1 2 3 4 5 6`.
    *   `2 3 ⍴ ...` reshapes this into a 2-row, 3-column matrix.

**Key Functions:**

*   **`⍳ n` (Iota): Generate Integers**
    *   `⍳5` ←→ `1 2 3 4 5` (Generates integers from 1 to `n`)
*   **`⍴ A` (Shape): Get Dimensions**
    *   `⍴ v` ←→ `3` (Vector `v` has length 3)
    *   `⍴ m` ←→ `2 3` (Matrix `m` has 2 rows, 3 columns)
*   **`dims ⍴ A` (Reshape): Structure Data**
    *   `12 ⍴ 0` ←→ `0 0 0 0 0 0 0 0 0 0 0 0` (Create a vector of 12 zeros)
    *   `2 2 ⍴ 1 2 3 4` ←→ `1 2`<br>`3 4` (Reshape a vector into a 2x2 matrix)
*   **`,` (Catenate): Join Arrays**
    *   `v , 9 8` ←→ `2 3 5 9 8` (Append elements along the last axis)
    *   `m , m` ←→ `1 2 3 1 2 3`<br>`4 5 6 4 5 6` (Join matrices side-by-side)
    *   `m ,[1] m` ←→ `1 2 3`<br>`4 5 6`<br>`1 2 3`<br>`4 5 6` (Join matrices vertically, specifying axis 1)
*   **`, A` (Ravel): Flatten Array**
    *   `, m` ←→ `1 2 3 4 5 6` (Convert matrix `m` into a vector)

### 3. Selecting and Filtering Data

Extracting specific parts of arrays is crucial.

**Key Functions:**

*   **`A[indices]` (Indexing): Select by Position**
    *   `v[1]` ←→ `2` (Get the first element - Note: APL often uses 1-based indexing)
    *   `v[3 1]` ←→ `5 2` (Get the 3rd and 1st elements)
    *   `m[2; 3]` ←→ `6` (Get element at row 2, column 3)
    *   `m[1; ]` ←→ `1 2 3` (Get the entire first row)
    *   `m[ ; 2]` ←→ `2 5` (Get the entire second column)
*   **`mask / A` (Compress): Select by Boolean Mask (Last Axis)**
    *   `bool ← 1 0 1`
    *   `bool / v` ←→ `2 5` (Select elements of `v` where `bool` is 1)
    *   `mask ← 1 0 0`
    *   `mask / m` ←→ `1`<br>`4` (Select columns of `m` where `mask` is 1)
*   **`mask ⌿ A` (Compress First Axis): Select Rows by Boolean Mask**
    *   `rowMask ← 0 1`
    *   `rowMask ⌿ m` ←→ `4 5 6` (Select the second row of `m`)
*   **`n ↑ A` (Take): Select First/Last `n` Elements**
    *   `2 ↑ v` ←→ `2 3` (Take the first 2 elements)
    *   `¯2 ↑ v` ←→ `3 5` (Take the last 2 elements)
    *   `1 ↑ m` ←→ `1 2 3` (Take the first row)
*   **`n ↓ A` (Drop): Remove First/Last `n` Elements**
    *   `1 ↓ v` ←→ `3 5` (Drop the first element)
    *   `¯1 ↓ v` ←→ `2 3` (Drop the last element)
*   **`A ∊ B` (Membership): Test if elements of `A` are in `B`**
    *   `v ∊ 3 4 5` ←→ `0 1 1` (Test each element of `v` for membership in `3 4 5`)
    *   `3 ∊ v` ←→ `1` (Test if 3 is anywhere in `v`)

**Example: Find values greater than 3 in `v`**
1.  Create a boolean mask: `mask ← v > 3` ←→ `0 0 1`
2.  Use compress: `mask / v` ←→ `5`

### 4. Summarizing and Aggregating Data (Reductions)

Apply an operation cumulatively along an axis.

**Key Operator:** `f/A` (Reduction) - Inserts function `f` between elements of `A` along the last axis.

*   **Sum:** `+/v` ←→ `2+3+5` ←→ `10`
*   **Product:** `×/v` ←→ `2×3×5` ←→ `30`
*   **Maximum:** `⌈/v` ←→ `2⌈3⌈5` ←→ `5`
*   **Minimum:** `⌊/v` ←→ `2⌊3⌊5` ←→ `2`
*   **And (logical):** `∧/ 1 1 0 1` ←→ `1∧1∧0∧1` ←→ `0`
*   **Or (logical):** `∨/ 1 1 0 1` ←→ `1∨1∨0∨1` ←→ `1`

**Matrices:** Reduction applies along the *last* axis by default (rows).

*   `+/m` ←→ `1+2+3`, `4+5+6` ←→ `6 15` (Sum of each row)

**First-Axis Reduction:** `f⌿A` - Applies `f` along the *first* axis (columns).

*   `+⌿m` ←→ `1+4`, `2+5`, `3+6` ←→ `5 7 9` (Sum of each column)

**Example: Calculate the average of vector `v`**
1.  Sum the elements: `sum ← +/v` ←→ `10`
2.  Count the elements: `count ← ⍴v` ←→ `3`
3.  Divide: `avg ← sum ÷ count` ←→ `3.333...`
    *   Combined: `(+/v) ÷ ⍴v`

### 5. Cumulative Operations (Scans)

Similar to reduction, but returns intermediate results.

**Key Operator:** `f\A` (Scan) - Applies `f` cumulatively along the last axis.

*   **Cumulative Sum:** `+\v` ←→ `2`, `2+3`, `2+3+5` ←→ `2 5 10`
*   **Cumulative Product:** `×\v` ←→ `2`, `2×3`, `2×3×5` ←→ `2 6 30`
*   **Cumulative Maximum:** `⌈\v` ←→ `2`, `2⌈3`, `2⌈3⌈5` ←→ `2 3 5`

**Matrices:** Scan applies along the *last* axis by default (rows).

*   `+\m` ←→ `1 (1+2) (1+2+3)`<br>`4 (4+5) (4+5+6)` ←→ `1 3 6`<br>`4 9 15`

**First-Axis Scan:** `f⍀A` - Applies `f` along the *first* axis (columns).

*   `+⍀m` ←→ `1 2 3`<br>`(1+4) (2+5) (3+6)` ←→ `1 2 3`<br>`5 7 9`

### 6. Reordering and Restructuring

Changing the order or orientation of data.

**Key Functions:**

*   **`⌽ A` (Reverse/Rotate Last Axis):**
    *   `⌽ v` ←→ `5 3 2` (Reverse the vector)
    *   `1 ⌽ v` ←→ `3 5 2` (Rotate left by 1 position)
    *   `¯1 ⌽ v` ←→ `5 2 3` (Rotate right by 1 position)
    *   `⌽ m` ←→ `3 2 1`<br>`6 5 4` (Reverse each row)
*   **`⊖ A` (Reverse/Rotate First Axis):**
    *   `⊖ m` ←→ `4 5 6`<br>`1 2 3` (Reverse the order of rows)
    *   `1 ⊖ m` ←→ `4 5 6`<br>`1 2 3` (Rotate rows up by 1 position)
*   **`⍉ A` (Transpose): Reverse dimension order.**
    *   `⍉ m` ←→ `1 4`<br>`2 5`<br>`3 6` (Simple matrix transpose)
*   **`⍋ A` (Grade Up): Indices to sort `A` ascending.**
    *   `grades ← ⍋ 30 10 50 20` ←→ `2 4 1 3`
    *   `(30 10 50 20)[grades]` ←→ `10 20 30 50` (Using grades to sort)
*   **`⍒ A` (Grade Down): Indices to sort `A` descending.**
    *   `grades ← ⍒ 30 10 50 20` ←→ `3 1 4 2`
    *   `(30 10 50 20)[grades]` ←→ `50 30 20 10`

### 7. Combining Arrays (Inner and Outer Products)

Powerful ways to combine arrays using pairs of functions.

*   **`A f.g B` (Inner Product): Generalized Matrix Multiplication**
    *   Combines reduction (`f`) with an element-wise operation (`g`).
    *   The last axis of `A` must match the first axis of `B`.
    *   **Standard Matrix Product:** `m1 +.× m2` (Uses `+` for reduction, `×` for element-wise)
        *   Example: `m ← 2 3 ⍴ ⍳6`, `mt ← ⍉m`
        *   `m +.× mt` ←→ `(1×1)+(2×2)+(3×3)` `(1×4)+(2×5)+(3×6)` <br> `(4×1)+(5×2)+(6×3)` `(4×4)+(5×5)+(6×6)` ←→ `14 32`<br>`32 77`
    *   **Logical Matrix Product (Connectivity):** `adj ∨.∧ adj` (Find paths of length 2 in adjacency matrix `adj`)
*   **`A ∘.f B` (Outer Product): Apply function `f` to all pairs of elements.**
    *   Creates a result with shape `(⍴A),(⍴B)`.
    *   **Multiplication Table:** `(⍳3) ∘.× (⍳4)` ←→ `1 2 3 4`<br>`2 4 6 8`<br>`3 6 9 12`
    *   **Distance Matrix:** `coords ← 3 2 ⍴ 0 0 3 4 6 0` (3 points in 2D)
        *   `diffs ← coords ∘.- coords` (All pairwise coordinate differences)
        *   `sqrdiffs ← diffs * 2`
        *   `sqrdists ← +/ sqrdiffs` (Sum squares along the coordinate axis)
        *   `dists ← * sqrdists * 0.5` (Take square root - approx distance matrix)
    *   **Comparison Table:** `v ∘.= v` ←→ `1 0 0`<br>`0 1 0`<br>`0 0 1` (Identity matrix based on `v`)

### 8. Advanced Example: Finding Prime Numbers (Sieve)

Let's find primes up to `N=15`.

1.  Create candidates: `cand ← 1 + ⍳N-1` ←→ `2 3 4 5 6 7 8 9 10 11 12 13 14 15` (Start from 2)
2.  Create a table of remainders: `rem_table ← cand ∘.| cand`
    *   This table shows `row | col` for each pair. `0` means `col` divides `row`.
    ```
       2  3  4  5  6  7  8  9 10 11 12 13 14 15
    2: 0  2  0  2  0  2  0  2  0  2  0  2  0  0
    3: 1  0  1  3  0  1  2  0  1  3  0  1  2  0
    4: 0  0  0  4  0  3  0  4  0  3  0  1  0  3
    ... (and so on)
    ```
3.  Identify non-primes: A number `j` is composite if it's divisible by some number `i` *other than itself* (`i ≠ j`) in the range.
    *   Check divisibility: `divides ← 0 = rem_table` (Where are the zeros?)
    *   Exclude self-division: `identity ← cand ∘.= cand` (Diagonal matrix)
    *   `non_self_divides ← divides ∧ ~identity`
    *   A number is composite if *any* other number divides it: `is_composite ← ∨/ non_self_divides` (OR reduction along rows)
4.  Primes are the candidates that are *not* composite: `is_prime ← ~is_composite`
5.  Select the primes: `is_prime / cand` ←→ `2 3 5 7 11 13`

This demonstrates how outer products and logical operations can express complex relationships concisely.

---

## Appendix A: Notation Quick Reference

This appendix summarizes the APL-like notation used in this document for quick lookup.

### Scalar Functions (Element-wise)

`⍵`: right argument (monadic), `⍺`: left argument (dyadic).

| Monadic Definition/Example | Monadic Name | Symbol | Dyadic Name | Dyadic Definition/Example | Notes                               |
| :------------------------- | :----------- | :----: | :---------- | :------------------------ | :---------------------------------- |
| `⍵`                        | Conjugate    | `+`    | Plus        | `⍺+⍵`                     | (Usually Identity for real numbers) |
| `0-⍵`                      | Negative     | `-`    | Minus       | `⍺-⍵`                     |                                     |
| `(⍵>0)-⍵<0`                | Signum       | `×`    | Times       | `⍺×⍵`                     |                                     |
| `1÷⍵`                      | Reciprocal   | `÷`    | Divide      | `⍺÷⍵`                     |                                     |
| `⍵⌈-⍵`                     | Magnitude    | `|`    | Residue     | `⍵-⍺×⌊⍵÷⍺`               | Dyadic requires `⍺≠0`              |
| `⌊⍵`                       | Floor        | `⌊`    | Minimum     | `⍺⌊⍵`                     |                                     |
| `⌈⍵`                       | Ceiling      | `⌈`    | Maximum     | `⍺⌈⍵`                     |                                     |
| `*⍵` (e^⍵)                 | Exponential  | `*`    | Power       | `⍺*⍵`                     |                                     |
| `⍟⍵` (ln ⍵)                | Natural log  | `⍟`    | Logarithm   | `⍺⍟⍵` (`(⍟⍵)÷⍟⍺`)       |                                     |
| `!⍵` (`×/1+⍳⍵`)            | Factorial    | `!`    | Binomial    | `⍺!⍵` (`(!⍵)÷(!⍺)×!⍵-⍺`) | (Combinations "n choose k")       |
| `○⍵` (π×⍵)                 | Pi times     | `○`    | Circular    | `⍺○⍵`                     | (Trigonometric functions)           |

**Boolean:** `~` (Not), `∧` (And), `∨` (Or), `⍲` (Nand), `⍱` (Nor)
**Relations:** `<`, `≤`, `=`, `≥`, `>`, `≠` (Yield `1` for true, `0` for false)

### Array Functions (Operate on whole arrays)

**Example Variables:**
*   `v` ← `2 3 5`
*   `m` ← `1 2 3`<br>`4 5 6` (a 2x3 matrix created via `2 3 ⍴ ⍳6`)

| Function              | Example / Description                                                                                             | Notes                                      |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| `⍳⍵` (Integers)       | `⍳5` ←→ `1 2 3 4 5`                                                                                               | Generates 1 to `⍵`                         |
| `⍴⍵` (Shape)          | `⍴v` ←→ `3` <br> `⍴m` ←→ `2 3`                                                                                    | Returns vector of dimension lengths        |
| `⍺⍴⍵` (Reshape)       | `2 3⍴⍳6` ←→ `m` <br> `2⍴4` ←→ `4 4`                                                                              | Reshapes `⍵` according to dimensions `⍺` |
| `⍺,⍵` (Catenate)      | `v,v` ←→ `2 3 5 2 3 5` <br> `m,m` ←→ `1 2 3 1 2 3`<br> `4 5 6 4 5 6`                                               | Joins along last axis by default           |
| `⍺,[k]⍵` (Catenate Axis)| `m,[1]m` ←→ `1 2 3`<br>`4 5 6`<br>`1 2 3`<br>`4 5 6`                                                              | Joins along specified axis `k`             |
| `,⍵` (Ravel)          | `,m` ←→ `1 2 3 4 5 6`                                                                                             | Flattens into a vector                     |
| `⍵[i]` (Indexing)     | `v[3 1]` ←→ `5 2` <br> `m[2;2]` ←→ `5` <br> `m[2;]` ←→ `4 5 6` <br> `m[;2]` ←→ `2 5`                                | Select elements/slices                     |
| `⍺/⍵` (Compress)      | `1 0 1/v` ←→ `2 5` (select elements) <br> `1 0 0 / m` ←→ `1`<br>`4` (select columns)                               | Select based on boolean mask `⍺` (last axis) |
| `⍺⌿⍵` (Compress First)| `0 1⌿m` ←→ `4 5 6` (select rows)                                                                                  | Select based on boolean mask `⍺` (first axis)|
| `⍺↑⍵` (Take)          | `2↑v` ←→ `2 3` (take first 2) <br> `¯2↑v` ←→ `3 5` (take last 2)                                                  | `⍺` can be negative for "from end"         |
| `⍺↓⍵` (Drop)          | `1↓v` ←→ `3 5` (drop first 1) <br> `¯1↓v` ←→ `2 3` (drop last 1)                                                  | `⍺` can be negative for "from end"         |
| `⌽⍵` (Reverse/Rotate) | `⌽v` ←→ `5 3 2` (reverse last axis) <br> `1⌽v` ←→ `3 5 2` (rotate last axis)                                     | Monadic: reverse; Dyadic: rotate `⍺` steps |
| `⊖⍵` (Reverse/Rotate First)| `⊖m` ←→ `4 5 6`<br>`1 2 3` (reverse first axis) <br> `1⊖m` ←→ `4 5 6`<br>`1 2 3` (rotate first axis)         | Monadic: reverse; Dyadic: rotate `⍺` steps |
| `⍉⍵` (Transpose)      | `⍉m` ←→ `1 4`<br>`2 5`<br>`3 6` (reverse axes order)                                                              | Dyadic `⍺⍉⍵` permutes axes using `⍺`      |
| `⍋⍵` (Grade Up)       | `⍋3 2 6 2` ←→ `2 4 1 3`                                                                                           | Indices for ascending sort                 |
| `⍒⍵` (Grade Down)     | `⍒3 2 6 2` ←→ `3 1 2 4`                                                                                           | Indices for descending sort                |
| `⍺⊥⍵` (Base Value)    | `10⊥v` ←→ `235` (value of `v` in base 10) <br> `2 2 2⊥1 0 1` ←→ `5` (binary to decimal)                           | Decode value `⍵` using radices `⍺`       |
| `⍺⊤⍵` (Representation)| `10 10 10⊤235` ←→ `2 3 5` (base 10 representation) <br> `2 2 2 2⊤5` ←→ `0 1 0 1` (decimal to binary)             | Encode value `⍵` using radices `⍺`       |
| `⍵∊⍺` (Membership)    | `v∊3` ←→ `0 1 0` (is 3 in `v`?) <br> `v∊5 2` ←→ `1 0 1` (are 5 or 2 in `v`?)                                     | Returns boolean array shape of `⍵`         |
| `⌹⍵` (Matrix Inverse) | `⌹m` computes matrix inverse (if square, invertible)                                                              |                                            |
| `⍺⌹⍵` (Matrix Divide) | Solves `⍵x = ⍺` for `x`                                                                                           | Least-squares solution if non-square       |
| `f/⍵` (Reduction)     | `+/v` ←→ `10` (sum) <br> `+/m` ←→ `6 15` (sum rows)                                                                | Apply `f` between elements (last axis)     |
| `f⌿⍵` (Reduce First)  | `+⌿m` ←→ `5 7 9` (sum columns)                                                                                    | Apply `f` between elements (first axis)    |
| `f\⍵` (Scan)          | `+\v` ←→ `2 5 10` (cumulative sum) <br> `+\m` ←→ `1 3 6`<br>`4 9 15` (scan rows)                                   | Cumulative `f` results (last axis)         |
| `f⍀⍵` (Scan First)    | `+⍀m` ←→ `1 2 3`<br>`5 7 9` (scan columns)                                                                        | Cumulative `f` results (first axis)        |
| `⍺ f.g ⍵` (Inner Prod)| `m +.× ⍉m` ←→ matrix product `m` times `transpose m`                                                              | General form `f`-reduction of `g`-pairs    |
| `⍺ ∘.f ⍵` (Outer Prod)| `(⍳2) ∘.+ (⍳3)` ←→ `1 2 3`<br>`2 3 4`                                                                              | Apply `f` to all pairs from `⍺` and `⍵`   |
| `f[k]⍵` (Axis Spec.)  | `+/[1]m` is same as `+⌿m` (sum along first axis)                                                                  | Apply `f` along specified axis `k`         |
