# Use an official Python 3.10 slim image
FROM python:3.10-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y libgl1

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port Render expects
EXPOSE 10000

# Start the Flask app with gunicorn on port 10000
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"] 