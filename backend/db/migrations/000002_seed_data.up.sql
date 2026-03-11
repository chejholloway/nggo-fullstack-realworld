-- Seed data for Conduit application

-- Insert sample users
INSERT INTO users (email, username, password, bio, image) VALUES
('john.doe@example.com', 'johndoe', '$2a$10$example_hash', 'Software developer and tech enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe'),
('jane.smith@example.com', 'janesmith', '$2a$10$example_hash', 'UX designer and coffee lover', 'https://api.dicebear.com/7.x/avataaars/svg?seed=janesmith'),
('mike.wilson@example.com', 'mikewilson', '$2a$10$example_hash', 'Full-stack developer and gamer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mikewilson'),
('sarah.jones@example.com', 'sarahjones', '$2a$10$example_hash', 'Data scientist and machine learning enthusiast', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahjones'),
('alex.chen@example.com', 'alexchen', '$2a$10$example_hash', 'DevOps engineer and cloud architect', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexchen'),
('emily.brown@example.com', 'emilybrown', '$2a$10$example_hash', 'Frontend developer and CSS expert', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emilybrown'),
('david.martinez@example.com', 'davidmartinez', '$2a$10$example_hash', 'Backend developer and database expert', 'https://api.dicebear.com/7.x/avataaars/svg?seed=davidmartinez'),
('lisa.taylor@example.com', 'lisataylor', '$2a$10$example_hash', 'Product manager and agile coach', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisataylor'),
('chris.lee@example.com', 'chrislee', '$2a$10$example_hash', 'Mobile developer and React Native expert', 'https://api.dicebear.com/7.x/avataaars/svg?seed=chrislee'),
('rachel.green@example.com', 'rachelgreen', '$2a$10$example_hash', 'QA engineer and automation specialist', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rachelgreen')
ON CONFLICT (email) DO NOTHING;

-- Insert sample tags
INSERT INTO tags (name) VALUES
('javascript'), ('python'), ('react'), ('vue'), ('angular'), ('nodejs'), ('typescript'), ('css'),
('html'), ('docker'), ('kubernetes'), ('aws'), ('gcp'), ('azure'), ('mongodb'), ('postgresql'),
('redis'), ('graphql'), ('rest'), ('api'), ('microservices'), ('devops'), ('testing'), ('agile'),
('machine-learning'), ('ai'), ('data-science'), ('blockchain'), ('web3'), ('security'), ('performance')
ON CONFLICT (name) DO NOTHING;

-- Insert sample articles
INSERT INTO articles (slug, title, description, body, author_id, created_at, updated_at) VALUES
(
    'getting-started-with-react-hooks',
    'Getting Started with React Hooks',
    'Learn the fundamentals of React Hooks and how to use them effectively in your applications.',
    'React Hooks revolutionized the way we write React components. In this comprehensive guide, we''ll explore everything from basic useState and useEffect hooks to advanced custom hooks.

## What are React Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They allow you to use state and other React features without writing a class.

## Basic Hooks

### useState
The useState hook lets you add React state to function components:

```javascript
import React, { useState } from ''react'';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

### useEffect
The useEffect hook lets you perform side effects in function components:

```javascript
import React, { useState, useEffect } from ''react'';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## Custom Hooks

You can build your own hooks to share stateful logic between components:

```javascript
import { useState, useEffect } from ''react'';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

## Best Practices

1. Only call Hooks at the top level
2. Only call Hooks from React functions
3. Use custom hooks to share logic
4. Keep your hooks small and focused

## Conclusion

React Hooks provide a more direct API to React concepts you already know: props, state, context, refs, and lifecycle. Start using them in your projects today!',
    (SELECT id FROM users WHERE username = 'johndoe' LIMIT 1),
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
),
(
    'building-scalable-microservices-with-nodejs',
    'Building Scalable Microservices with Node.js',
    'A comprehensive guide to designing and implementing microservices architecture using Node.js.',
    'Microservices architecture has become the de facto standard for building large-scale applications. In this article, we''ll explore how to build scalable microservices using Node.js.

## What are Microservices?

Microservices are an architectural style that structures an application as a collection of loosely coupled services. Each service is self-contained and implements a specific business capability.

## Benefits of Microservices

- **Independent Deployment**: Services can be deployed independently
- **Technology Diversity**: Different services can use different technologies
- **Fault Isolation**: Failure in one service doesn''t affect others
- **Scalability**: Individual services can be scaled based on demand

## Building Microservices with Node.js

### Service Structure

Each microservice should follow a consistent structure:

```
user-service/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── tests/
├── package.json
└── Dockerfile
```

### Communication Patterns

Services communicate through:

1. **REST APIs**: Synchronous HTTP communication
2. **Message Queues**: Asynchronous communication
3. **gRPC**: High-performance RPC communication

### Example: User Service

```javascript
const express = require(''express'');
const { Pool } = require(''pg'');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get(''/users/:id'', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(''SELECT * FROM users WHERE id = $1'', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log(''User service running on port 3001'');
});
```

## Best Practices

1. **Single Responsibility**: Each service should do one thing well
2. **API Gateway**: Use an API gateway to handle routing
3. **Service Discovery**: Implement service discovery mechanisms
4. **Monitoring**: Monitor each service independently
5. **Circuit Breakers**: Implement circuit breakers for resilience

## Conclusion

Building microservices with Node.js requires careful planning and architecture. Follow these best practices to build scalable and maintainable systems.',
    (SELECT id FROM users WHERE username = 'janesmith' LIMIT 1),
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
),
(
    'typescript-best-practices-for-2024',
    'TypeScript Best Practices for 2024',
    'Modern TypeScript patterns and best practices every developer should know.',
    'TypeScript has evolved significantly over the years. Here are the best practices you should follow in 2024 to write clean, maintainable, and type-safe code.

## Configuration

### Strict Mode
Always enable strict mode in your tsconfig.json:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

## Type Definitions

### Use Interface vs Type

Use interfaces for object shapes that might be extended:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}
```

Use types for unions, intersections, and computed types:

```typescript
type Status = ''pending'' | ''approved'' | ''rejected'';
type ID = string | number;
```

## Generics

### Generic Functions
Write reusable functions with generics:

```typescript
function apiRequest<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json());
}

interface User {
  id: string;
  name: string;
}

const user = await apiRequest<User>(''/api/user/1'');
```

### Generic Constraints

Add constraints to generics:

```typescript
interface Identifiable {
  id: string;
}

function findById<T extends Identifiable>(
  items: T[],
  id: string
): T | undefined {
  return items.find(item => item.id === id);
}
```

## Utility Types

### Built-in Utility Types

Leverage TypeScript''s built-in utility types:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Omit password
type PublicUser = Omit<User, ''password''>;

// Make all properties optional
type PartialUser = Partial<User>;

// Pick specific properties
type UserSummary = Pick<User, ''id'' | ''name''>;
```

## Advanced Patterns

### Discriminated Unions

Use discriminated unions for type-safe state management:

```typescript
type LoadingState = {
  status: ''loading'';
};

type SuccessState<T> = {
  status: ''success'';
  data: T;
};

type ErrorState = {
  status: ''error'';
  error: string;
};

type State<T> = LoadingState | SuccessState<T> | ErrorState;

function handleState<T>(state: State<T>) {
  switch (state.status) {
    case ''loading'':
      console.log(''Loading...'');
      break;
    case ''success'':
      console.log(''Data:'', state.data);
      break;
    case ''error'':
      console.error(''Error:'', state.error);
      break;
  }
}
```

## Conclusion

Following these TypeScript best practices will help you write more maintainable and type-safe code. Keep learning and stay updated with the latest TypeScript features!',
    (SELECT id FROM users WHERE username = 'mikewilson' LIMIT 1),
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),
(
    'optimizing-react-app-performance',
    'Optimizing React App Performance',
    'Practical techniques to make your React applications faster and more efficient.',
    'Performance is crucial for user experience. Here are proven techniques to optimize your React applications.

## Code Splitting

### Lazy Loading Components
Use React.lazy() for code splitting:

```javascript
import React, { lazy, Suspense } from ''react'';

const HeavyComponent = lazy(() => import(''./HeavyComponent''));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Route-based Splitting
Split code at the route level:

```javascript
import { lazy, Suspense } from ''react'';
import { BrowserRouter, Routes, Route } from ''react-router-dom'';

const Home = lazy(() => import(''./pages/Home''));
const About = lazy(() => import(''./pages/About''));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

## Memoization

### React.memo
Prevent unnecessary re-renders:

```javascript
import React from ''react'';

const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* expensive rendering */}</div>;
});
```

### useMemo
Memoize expensive calculations:

```javascript
import React, { useMemo } from ''react'';

function Component({ items, filter }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.type === filter);
  }, [items, filter]);

  return <div>{filteredItems.map(/* render */)}</div>;
}
```

### useCallback
Memoize functions:

```javascript
import React, { useCallback } from ''react'';

function Component({ items, onItemClick }) {
  const handleClick = useCallback((item) => {
    onItemClick(item.id);
  }, [onItemClick]);

  return (
    <div>
      {items.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
}
```

## Virtualization

### react-window
For large lists, use virtualization:

```javascript
import { FixedSizeList as List } from ''react-window'';

function BigList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

## Bundle Optimization

### Tree Shaking
Ensure tree shaking works:

```javascript
// Instead of this
import * as _ from ''lodash'';

// Use this
import { debounce } from ''lodash'';
```

### Dynamic Imports
Load libraries dynamically:

```javascript
async function loadChart() {
  const { Chart } = await import(''chart.js'');
  // use Chart
}
```

## Monitoring Performance

### React DevTools Profiler
Use the React DevTools Profiler to identify performance bottlenecks.

### Performance API
Measure performance programmatically:

```javascript
function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}
```

## Conclusion

Optimizing React performance requires a combination of techniques. Apply these strategies based on your specific use case and measure the impact of each optimization.',
    (SELECT id FROM users WHERE username = 'sarahjones' LIMIT 1),
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
),
(
    'modern-css-techniques-every-developer-should-know',
    'Modern CSS Techniques Every Developer Should Know',
    'Explore powerful CSS features that will transform the way you style web applications.',
    'CSS has evolved tremendously over the years. Here are modern techniques that every developer should master.

## CSS Grid and Flexbox

### CSS Grid for Layouts
Grid is perfect for two-dimensional layouts:

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.grid-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 8px;
}
```

### Flexbox for Components
Flexbox excels at one-dimensional layouts:

```css
.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## CSS Custom Properties

### Dynamic Theming
Use CSS variables for theming:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

[data-theme="dark"] {
  --primary-color: #60a5fa;
  --secondary-color: #94a3b8;
  --background-color: #1f2937;
  --text-color: #f9fafb;
}

.button {
  background-color: var(--primary-color);
  color: var(--background-color);
  border-radius: var(--border-radius);
  transition: var(--transition);
}
```

## Container Queries

### Responsive Components
Container queries enable responsive components:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

## Modern CSS Selectors

### :has() Selector
The parent selector:

```css
.card:has(.badge) {
  border-left: 4px solid var(--primary-color);
}

.form:has(:invalid) {
  border-color: #ef4444;
}
```

### :is() and :where()
Simplify complex selectors:

```css
/* Instead of this */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family);
}

/* Use this */
:is(h1, h2, h3, h4, h5, h6) {
  font-family: var(--font-family);
}
```

## CSS Animations and Transitions

### Smooth Transitions
```css
.button {
  background-color: var(--primary-color);
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
```

### Keyframe Animations
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}
```

## Modern Layout Techniques

### Subgrid
```css
.grid-parent {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}

.grid-child {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 3;
}
```

### Logical Properties
```css
.card {
  margin-inline: auto;
  padding-block: 2rem;
  border-inline-start: 4px solid var(--primary-color);
}
```

## Conclusion

Modern CSS provides powerful tools for creating responsive, maintainable, and performant styles. Stay updated with the latest features and use them appropriately in your projects.',
    (SELECT id FROM users WHERE username = 'alexchen' LIMIT 1),
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
(
    'secure-authentication-strategies-for-web-apps',
    'Secure Authentication Strategies for Web Apps',
    'Implement robust authentication systems using modern security best practices.',
    'Security is paramount in web applications. Here''s how to implement secure authentication strategies.

## Password Security

### Hashing Passwords
Never store plain text passwords:

```javascript
import bcrypt from ''bcrypt'';

async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### Password Policies
Implement strong password requirements:

```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return password.length >= minLength &&
         hasUpperCase &&
         hasLowerCase &&
         hasNumbers &&
         hasSpecialChar;
}
```

## JWT Authentication

### Secure JWT Implementation
```javascript
import jwt from ''jsonwebtoken'';
import crypto from ''crypto'';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString(''hex'');

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ''15m'',
    issuer: ''your-app'',
    audience: ''your-users''
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(''Invalid token'');
  }
}
```

### Refresh Tokens
Implement refresh tokens for better security:

```javascript
const refreshTokens = new Map();

function generateRefreshToken(userId) {
  const refreshToken = crypto.randomBytes(32).toString(''hex'');
  refreshTokens.set(refreshToken, { userId, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return refreshToken;
}

function validateRefreshToken(refreshToken) {
  const tokenData = refreshTokens.get(refreshToken);
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    refreshTokens.delete(refreshToken);
    return null;
  }
  return tokenData;
}
```

## Multi-Factor Authentication

### TOTP Implementation
```javascript
import speakeasy from ''speakeasy'';
import qrcode from ''qrcode'';

function generateTOTPSecret(userEmail) {
  return speakeasy.generateSecret({
    name: `MyApp (${userEmail})`,
    issuer: ''MyApp'',
    length: 32
  });
}

async function generateQRCode(secret) {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: secret.name,
    issuer: secret.issuer
  });
  
  return await qrcode.toDataURL(otpauthUrl);
}

function verifyTOTP(token, secret) {
  return speakeasy.totp.verify({
    secret: secret.base32,
    encoding: ''base32'',
    token: token,
    window: 2
  });
}
```

## Session Management

### Secure Session Configuration
```javascript
import session from ''express-session'';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === ''production'',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: ''strict''
  }
}));
```

## Rate Limiting

### Implement Rate Limiting
```javascript
import rateLimit from ''express-rate-limit'';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests
  message: ''Too many login attempts, please try again later.'',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post(''/login'', loginLimiter, loginHandler);
```

## Security Headers

### Set Security Headers
```javascript
import helmet from ''helmet'';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["''self''"],
      styleSrc: ["''self''", "''unsafe-inline''"],
      scriptSrc: ["''self''"],
      imgSrc: ["''self''", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Conclusion

Security is an ongoing process. Implement these strategies and stay updated with the latest security best practices to protect your users and application.',
    (SELECT id FROM users WHERE username = 'emilybrown' LIMIT 1),
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    'introduction-to-machine-learning-with-python',
    'Introduction to Machine Learning with Python',
    'A beginner-friendly guide to getting started with machine learning using Python.',
    'Machine learning is transforming industries worldwide. This guide will help you get started with ML using Python.

## What is Machine Learning?

Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

## Setting Up Your Environment

### Required Libraries
Install the essential ML libraries:

```bash
pip install numpy pandas scikit-learn matplotlib jupyter
```

### Development Environment
Use Jupyter Notebook for interactive development:

```bash
jupyter notebook
```

## Basic ML Concepts

### Supervised Learning
Learning from labeled data:

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load dataset
iris = load_iris()
X, y = iris.data, iris.target

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.2f}")
```

### Unsupervised Learning
Finding patterns in unlabeled data:

```python
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

# Generate sample data
from sklearn.datasets import make_blobs
X, _ = make_blobs(n_samples=300, centers=4, random_state=42)

# Apply K-means clustering
kmeans = KMeans(n_clusters=4, random_state=42)
clusters = kmeans.fit_predict(X)

# Visualize results
plt.scatter(X[:, 0], X[:, 1], c=clusters, cmap=''viridis'')
plt.scatter(kmeans.cluster_centers_[:, 0], kmeans.cluster_centers_[:, 1], 
           marker=''x'', s=200, linewidths=3, color=''red'')
plt.title(''K-means Clustering'')
plt.show()
```

## Data Preprocessing

### Handling Missing Values
```python
import pandas as pd

# Load data
df = pd.read_csv(''data.csv'')

# Check for missing values
print(df.isnull().sum())

# Fill missing values
df[''age''].fillna(df[''age''].mean(), inplace=True)
df[''salary''].fillna(df[''salary''].median(), inplace=True)
```

### Feature Scaling
```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Standardization
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Normalization
normalizer = MinMaxScaler()
X_normalized = normalizer.fit_transform(X)
```

## Model Evaluation

### Cross-Validation
```python
from sklearn.model_selection import cross_val_score

# Perform 5-fold cross-validation
cv_scores = cross_val_score(model, X, y, cv=5)
print(f"Cross-validation scores: {cv_scores}")
print(f"Mean CV score: {cv_scores.mean():.2f}")
```

### Classification Metrics
```python
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# Classification report
print(classification_report(y_test, y_pred))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt=''d'', cmap=''Blues'')
plt.xlabel(''Predicted'')
plt.ylabel(''Actual'')
plt.show()
```

## Real-World Example

### Predicting House Prices
```python
from sklearn.datasets import fetch_california_housing
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Load dataset
housing = fetch_california_housing()
X, y = housing.data, housing.target

# Split and scale data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train model
model = LinearRegression()
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Squared Error: {mse:.2f}")
print(f"R² Score: {r2:.2f}")
```

## Next Steps

1. **Deep Learning**: Explore TensorFlow and PyTorch
2. **Natural Language Processing**: Work with text data
3. **Computer Vision**: Image classification and object detection
4. **Deployment**: Learn to deploy models using Flask or FastAPI

## Conclusion

Machine learning with Python is accessible and powerful. Start with these fundamentals and gradually explore more advanced topics. Practice with real datasets and build projects to solidify your understanding.',
    (SELECT id FROM users WHERE username = 'davidmartinez' LIMIT 1),
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    'docker-best-practices-for-production',
    'Docker Best Practices for Production',
    'Essential Docker practices for building secure and efficient containerized applications.',
    'Docker has revolutionized application deployment. Here are the best practices for production environments.

## Image Optimization

### Use Minimal Base Images
Start with minimal base images:

```dockerfile
# Instead of this
FROM ubuntu:20.04

# Use this
FROM alpine:3.18
# or for Node.js
FROM node:18-alpine
```

### Multi-stage Builds
Reduce image size with multi-stage builds:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Layer Caching
Optimize layer caching:

```dockerfile
# Copy dependency files first
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build
```

## Security Best Practices

### Run as Non-root User
```dockerfile
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set ownership
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

### Use Specific Tags
Avoid using `latest` tag:

```dockerfile
# Instead of this
FROM node:latest

# Use this
FROM node:18.17.0-alpine
```

### Scan for Vulnerabilities
Regularly scan images:

```bash
# Use Trivy
trivy image myapp:latest

# Use Docker Scout
docker scout cves myapp:latest
```

## Resource Management

### Set Resource Limits
```yaml
# docker-compose.yml
version: ''3.8''
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: ''0.5''
          memory: 512M
        reservations:
          cpus: ''0.25''
          memory: 256M
```

### Health Checks
Implement health checks:

```dockerfile
FROM node:18-alpine
# ... app setup ...

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["npm", "start"]
```

## Networking

### Use User-defined Networks
```yaml
version: ''3.8''
services:
  app:
    image: myapp:latest
    networks:
      - app-network
  
  database:
    image: postgres:15-alpine
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### Expose Only Necessary Ports
```dockerfile
# Only expose required ports
EXPOSE 3000

# Don''t expose database ports externally
```

## Data Persistence

### Use Volumes
```yaml
version: ''3.8''
services:
  database:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

volumes:
  postgres_data:
```

### Backup Strategy
Implement automated backups:

```bash
#!/bin/bash
# backup.sh

docker exec postgres_container pg_dump -U user myapp > backup_$(date +%Y%m%d_%H%M%S).sql

# Keep only last 7 days of backups
find /backups -name "backup_*.sql" -mtime +7 -delete
```

## Monitoring and Logging

### Centralized Logging
```yaml
version: ''3.8''
services:
  app:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  elasticsearch_data:
```

### Monitoring with Prometheus
```yaml
version: ''3.8''
services:
  app:
    image: myapp:latest
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=3000"
  
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## Environment Configuration

### Use Environment Variables
```dockerfile
FROM node:18-alpine

ENV NODE_ENV=production
ENV PORT=3000

COPY . .

RUN npm run build

EXPOSE $PORT
CMD ["npm", "start"]
```

### Configuration Management
```yaml
version: ''3.8''
services:
  app:
    image: myapp:latest
    env_file:
      - .env.production
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
```

## Conclusion

Following these Docker best practices will help you build secure, efficient, and maintainable containerized applications for production environments.',
    (SELECT id FROM users WHERE username = 'lisataylor' LIMIT 1),
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
),
(
    'building-responsive-layouts-with-css-grid',
    'Building Responsive Layouts with CSS Grid',
    'Master CSS Grid to create complex, responsive layouts with minimal code.',
    'CSS Grid is a powerful layout system that makes creating complex layouts intuitive and maintainable.

## Grid Fundamentals

### Basic Grid Container
```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 2rem;
  height: 100vh;
}
```

### Grid Areas
Define named grid areas:

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

## Responsive Grid Design

### Auto-fit and Auto-fill
Create responsive grids that adapt to content:

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}
```

### Container Queries
Combine Grid with Container Queries:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 700px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Advanced Grid Techniques

### Subgrid
Child elements can inherit parent grid:

```css
.parent-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
}

.child-grid {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 3;
  gap: inherit;
}
```

### Grid and Flexbox Combination
Use Grid for overall layout, Flexbox for component layout:

```css
.page-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## Practical Examples

### Magazine Layout
```css
.magazine-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 2rem;
  height: 100vh;
}

.featured-article {
  grid-column: 1;
  grid-row: 1 / 3;
}

.sidebar {
  grid-column: 2;
  grid-row: 1 / 4;
}

.article-grid {
  grid-column: 1;
  grid-row: 3;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

### Dashboard Layout
```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  height: 100vh;
}

.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.widget-large {
  grid-column: span 2;
  grid-row: span 2;
}
```

## Animation and Transitions

### Grid Animations
Animate grid layout changes:

```css
.animated-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  transition: all 0.3s ease;
}

.animated-grid > * {
  transition: all 0.3s ease;
}

.animated-grid:hover > * {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
```

## Browser Support and Fallbacks

### Feature Detection
```css
@supports (display: grid) {
  .layout {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
  }
}

@supports not (display: grid) {
  .layout {
    display: flex;
    flex-wrap: wrap;
  }
  
  .layout > * {
    flex: 1 1 300px;
    margin: 1rem;
  }
}
```

## Performance Considerations

### Optimize Grid Performance
```css
.optimized-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  will-change: transform;
  contain: layout style paint;
}

.grid-item {
  contain: layout style paint;
}
```

## Conclusion

CSS Grid provides powerful tools for creating complex, responsive layouts. Master these techniques to build modern, maintainable layouts that work across all devices.',
    (SELECT id FROM users WHERE username = 'chrislee' LIMIT 1),
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
),
(
    'web-performance-optimization-techniques',
    'Web Performance Optimization Techniques',
    'Comprehensive guide to making your websites faster and more efficient.',
    'Website performance directly impacts user experience and conversion rates. Here are proven optimization techniques.

## Performance Metrics

### Core Web Vitals
Monitor these essential metrics:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### Measuring Performance
```javascript
// Measure performance in the browser
performance.mark(''app-start'');

// Your application code

performance.mark(''app-end'');
performance.measure(''app-load-time'', ''app-start'', ''app-end'');

const measures = performance.getEntriesByName(''app-load-time'');
console.log(`App load time: ${measures[0].duration}ms`);
```

## Image Optimization

### Modern Image Formats
Use next-gen image formats:

```html
<!-- WebP with fallback -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.avif" type="image/avif">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

### Responsive Images
```html
<img 
  src="image-small.jpg"
  srcset="image-medium.jpg 768w, image-large.jpg 1200w"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Description"
  loading="lazy"
>
```

### Image Compression
```bash
# Using squoosh CLI
squoosh-cli --optimize image.jpg --output image.optimized.jpg

# Using sharp (Node.js)
const sharp = require(''sharp'');
await sharp(''input.jpg'')
  .resize(800, 600, { fit: ''inside'' })
  .jpeg({ quality: 80 })
  .toFile(''output.jpg'');
```

## Code Optimization

### JavaScript Minification
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
};
```

### Tree Shaking
```javascript
// Import only what you need
import { debounce } from ''lodash-es'';
// Instead of
import _ from ''lodash'';
```

### Code Splitting
```javascript
// Dynamic imports
const loadModule = async () => {
  const module = await import(''./heavy-module.js'');
  module.doSomething();
};

// Route-based splitting
const Home = lazy(() => import(''./components/Home''));
const About = lazy(() => import(''./components/About''));
```

## Caching Strategies

### HTTP Caching
```javascript
// Service Worker for caching
self.addEventListener(''fetch'', event => {
  if (event.request.destination === ''image'') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          caches.open(''images'').then(cache => {
            cache.put(event.request, fetchResponse.clone());
          });
          return fetchResponse;
        });
      })
    );
  }
});
```

### Browser Caching
```javascript
// Cache API responses
const cacheResponse = async (url, data) => {
  const cache = await caches.open(''api-cache'');
  const response = new Response(JSON.stringify(data), {
    headers: { ''Content-Type'': ''application/json'' }
  });
  cache.put(url, response);
};
```

## Network Optimization

### HTTP/2 and HTTP/3
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    # Enable HTTP/3 (requires nginx 1.25+)
    # listen 443 ssl http3;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### Resource Hints
```html
<!-- DNS prefetch -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>

<!-- Preload critical resources -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/hero-image.jpg" as="image">

<!-- Prefetch next page -->
<link rel="prefetch" href="/next-page.html">
```

## Critical CSS

### Extract Critical CSS
```javascript
// Using penthouse
const penthouse = require(''penthouse'');
const fs = require(''fs'');

penthouse({
  url: ''https://example.com'',
  css: ''path/to/style.css'',
})
.then(criticalCss => {
  fs.writeFileSync(''critical.css'', criticalCss);
});
```

### Inline Critical CSS
```html
<style>
/* Critical CSS inlined */
</style>

<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel=''stylesheet''">
<noscript><link rel="stylesheet" href="styles.css"></noscript>```

## Performance Monitoring

### Real User Monitoring (RUM)
```javascript
// Send performance data to analytics
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === ''largest-contentful-paint'') {
      // Send LCP to analytics
      analytics.track(''LCP'', { value: entry.startTime });
    }
  }
});

observer.observe({ entryTypes: [''largest-contentful-paint''] });
```

### Synthetic Monitoring
```javascript
// Automated performance testing
const lighthouse = require(''lighthouse'');
const chromeLauncher = require(''chrome-launcher'');

const runLighthouse = async (url) => {
  const chrome = await chromeLauncher.launch();
  const options = { logLevel: ''info'', output: ''json'', port: chrome.port };
  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  return runnerResult.lhr;
};
```

## Database Optimization

### Query Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_article_created_at ON articles(created_at DESC);

-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE SELECT * FROM articles WHERE author_id = $1 ORDER BY created_at DESC;
```

### Connection Pooling
```javascript
// PostgreSQL connection pool
const { Pool } = require(''pg'');

const pool = new Pool({
  host: ''localhost'',
  database: ''myapp'',
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Conclusion

Performance optimization is an ongoing process. Implement these techniques, measure their impact, and continuously iterate to improve your website''s performance.',
    (SELECT id FROM users WHERE username = 'rachelgreen' LIMIT 1),
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
);

-- Insert article-tag relationships
INSERT INTO article_tags (article_id, tag_id)
SELECT a.id, t.id
FROM articles a
CROSS JOIN tags t
WHERE a.slug IN (
    'getting-started-with-react-hooks',
    'building-scalable-microservices-with-nodejs',
    'typescript-best-practices-for-2024',
    'optimizing-react-app-performance',
    'modern-css-techniques-every-developer-should-know',
    'secure-authentication-strategies-for-web-apps',
    'introduction-to-machine-learning-with-python',
    'docker-best-practices-for-production',
    'building-responsive-layouts-with-css-grid',
    'web-performance-optimization-techniques'
)
AND t.name IN (
    CASE 
        WHEN a.slug = 'getting-started-with-react-hooks' THEN 'react'
        WHEN a.slug = 'building-scalable-microservices-with-nodejs' THEN 'nodejs'
        WHEN a.slug = 'typescript-best-practices-for-2024' THEN 'typescript'
        WHEN a.slug = 'optimizing-react-app-performance' THEN 'react'
        WHEN a.slug = 'modern-css-techniques-every-developer-should-know' THEN 'css'
        WHEN a.slug = 'secure-authentication-strategies-for-web-apps' THEN 'security'
        WHEN a.slug = 'introduction-to-machine-learning-with-python' THEN 'machine-learning'
        WHEN a.slug = 'docker-best-practices-for-production' THEN 'docker'
        WHEN a.slug = 'building-responsive-layouts-with-css-grid' THEN 'css'
        WHEN a.slug = 'web-performance-optimization-techniques' THEN 'performance'
    END,
    CASE 
        WHEN a.slug = 'getting-started-with-react-hooks' THEN 'javascript'
        WHEN a.slug = 'building-scalable-microservices-with-nodejs' THEN 'microservices'
        WHEN a.slug = 'typescript-best-practices-for-2024' THEN 'javascript'
        WHEN a.slug = 'optimizing-react-app-performance' THEN 'javascript'
        WHEN a.slug = 'modern-css-techniques-every-developer-should-know' THEN 'html'
        WHEN a.slug = 'secure-authentication-strategies-for-web-apps' THEN 'api'
        WHEN a.slug = 'introduction-to-machine-learning-with-python' THEN 'python'
        WHEN a.slug = 'docker-best-practices-for-production' THEN 'devops'
        WHEN a.slug = 'building-responsive-layouts-with-css-grid' THEN 'html'
        WHEN a.slug = 'web-performance-optimization-techniques' THEN 'web'
    END,
    CASE 
        WHEN a.slug = 'getting-started-with-react-hooks' THEN 'hooks'
        WHEN a.slug = 'building-scalable-microservices-with-nodejs' THEN 'devops'
        WHEN a.slug = 'typescript-best-practices-for-2024' THEN 'types'
        WHEN a.slug = 'optimizing-react-app-performance' THEN 'performance'
        WHEN a.slug = 'modern-css-techniques-every-developer-should-know' THEN 'grid'
        WHEN a.slug = 'secure-authentication-strategies-for-web-apps' THEN 'authentication'
        WHEN a.slug = 'introduction-to-machine-learning-with-python' THEN 'data-science'
        WHEN a.slug = 'docker-best-practices-for-production' THEN 'kubernetes'
        WHEN a.slug = 'building-responsive-layouts-with-css-grid' THEN 'flexbox'
        WHEN a.slug = 'web-performance-optimization-techniques' THEN 'optimization'
    END
)
ON CONFLICT DO NOTHING;

-- Insert some sample favorites
INSERT INTO favorites (user_id, article_id)
SELECT u.id, a.id
FROM users u
CROSS JOIN articles a
WHERE u.username IN ('johndoe', 'janesmith', 'mikewilson')
AND a.slug IN (
    'getting-started-with-react-hooks',
    'building-scalable-microservices-with-nodejs',
    'typescript-best-practices-for-2024'
)
ON CONFLICT DO NOTHING;
