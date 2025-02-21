Multi-Service Kubernetes Application
 
Part 1: Setting Up the Kubernetes Environment
1.	First we have to Start the Minikube by downloading it from the official website and then after installed we will have to open the terminal and run the following code:
minikube start
2.	For using Minikube’s Docker Daemon run the following code:
eval $(minikube docker-env)

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Part 2: Creating and Containerizing the Services
Backend API (FastAPI)
We have to create a folder with the name “backend”
1.	 First we create the API Code (backend/app.py)
2.	Then we create the “backend/requirements.txt” with the following code: 
fastapi
uvicorn
3.	Lastly we creaete a Dockerfile (backend/Dockerfile) with the following code: 
FROM python:3.9
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
4.	For building the Backend Image run the following code:
docker build -t backend:v1 ./backend
Frontend (Node.js)
Now we create a folder with the name “frontend”
1.	First, Create the Frontend Code (frontend/server.js)
2.	The, Create frontend/package.json
3.	Lastly, Write a Dockerfile (frontend/Dockerfile) with the following code:
FROM node:14
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
4.	For building the Frontend Image run the following code:
docker build -t frontend:v1 ./frontend

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Part 3: Deploying Services to Kubernetes
1. To deploy the Backend API
We have to create the “backend-deployment.yaml” with the following code:

apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: backend:v1
        ports:
        - containerPort: 8000

Then for applying the deployment running the following code:
kubectl apply -f backend-deployment.yaml

2. Deploying the Frontend

Now we have to do the same with the frontend, create “frontend-deployment.yaml” with the following code:
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: frontend:v1
        ports:
        - containerPort: 3000


Apply the deployment running the following code:
kubectl apply -f frontend-deployment.yaml

3. To create Kubernetes Services
We have to create now the services, but following the same process that we had with the deployments, we create the “backend-service.yaml” with the following code:
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
Then we create the “frontend-service.yaml” with the following code:
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: NodePort

And now we apply the services by running the following codes:
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-service.yaml

If after creating the images you encounter an error like “can’t pull image” when running: the kubectl get pods
You may need to load manually the images, for that run this code: 

minikube image load <image_name> 

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Part 4: Demonstrating In-Place Upgrades 

1. Now we have to modify the Backend API Code

By editing the backend/app.py to change the response message and replacing the following code to the app.py  inside of the backend folder.
@app.get("/")
def read_root():
    return {"message": "Welcome to version 2!"}

2. Then we have to build and Tag the New Docker Image
Run this code
docker build -t backend:v2 ./backend

3. After that we have to perform a Rolling Update in Kubernetes
By running this code
kubectl set image deployment/backend-deployment backend=backend:v2
And to monitor the update process run:
kubectl rollout status deployment/backend-deployment

4. Lastly, let’s Verify the Upgrade
Run this code:
curl $(minikube service backend-service --url)

To access the Application and retrieve the frontend URL:
Run this code:
minikube service frontend-service --url
This will open in the browser a window with the frontend displaying data from the API.

