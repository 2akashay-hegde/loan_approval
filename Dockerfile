FROM python:3.14-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt requirement.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

ENV PORT=5000
CMD [ "python", "app.py" ]
