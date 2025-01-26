FROM python:3.12-slim-bookworm

WORKDIR /app

RUN pip install Flask
RUN pip install Flask-CORS
RUN pip install orjson
RUN pip install docker
RUN pip install waitress

COPY api.py .

# Dec 2 is the birthday of Ganyu >_<
EXPOSE 1202

CMD ["python", "api.py"]