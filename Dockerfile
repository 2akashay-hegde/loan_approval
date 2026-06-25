FROM python:3.14.3

#working directory
WORKDIR /app

COPY . . 

#install dependencies
RUN pip install -r requirement.txt
EXPOSE 5000

CMD [ "python", "app.py" ]
