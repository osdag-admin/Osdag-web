FROM ubuntu:22.04


ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Kolkata

RUN apt update && \
    apt install -y wget bzip2 software-properties-common curl python3-pip libpq-dev libssl-dev build-essential libgl1-mesa-glx libglu1-mesa freecad texlive-full && \
    mkdir -p /snap/bin && \
    ln -s /usr/bin/freecad /snap/bin/freecad.cmd


RUN mkdir -p /opt/conda && \
    wget https://repo.anaconda.com/miniconda/Miniconda3-py37_4.8.2-Linux-x86_64.sh -O /opt/conda/miniconda.sh && \
    bash /opt/conda/miniconda.sh -b -p /opt/miniconda && \
    rm -f /opt/conda/miniconda.sh && \
    /opt/miniconda/bin/conda init bash

COPY install_dependencies.sh /app/install_dependencies.sh
COPY ./conda_packages/ /app/conda_packages/

RUN bash -c "source /opt/miniconda/etc/profile.d/conda.sh && \
    conda create -n myenv python=3.7.6 -y && \
    conda activate myenv && \
    pip install --upgrade pip pyopenssl && \
    pip install -r requirements.txt"
    # pip install /app/conda_packages/pdflatex-0.1.3.tar.gz \
    #              /app/conda_packages/PyLaTeX-1.3.1.tar.gz \
    #              /app/conda_packages/XlsxWriter-1.2.8.tar.gz \
    #              /app/conda_packages/Pygments-2.6.1.tar.gz \
    #              /app/conda_packages/openpyxl-3.0.3.tar.gz \
    #              /app/conda_packages/PyYAML-5.3.1.tar.gz \
    #              /app/conda_packages/PyQt5-5.14.2-5.14.2-cp35.cp36.cp37.cp38-abi3-manylinux2014_x86_64.whl \
    #              /app/conda_packages/pdfkit-0.6.1-py3-none-any.whl \
    #              /app/conda_packages/pandas-1.0.5-cp37-cp37m-manylinux1_x86_64.whl \
    #              /app/conda_packages/pynput-1.6.8-py2.py3-none-any.whl \
    #              /app/conda_packages/PyGithub-1.54.1.tar.gz"

WORKDIR /app

RUN chmod +x /app/install_dependencies.sh && \
    bash -c "source /opt/miniconda/etc/profile.d/conda.sh && \
    conda activate myenv && \
    /app/install_dependencies.sh"

COPY . /app

RUN bash -c "source /opt/miniconda/etc/profile.d/conda.sh && \
    conda activate myenv && \
    pip install -r requirements.txt"

ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libstdc++.so.6
EXPOSE 8000

CMD ["bash", "-c", "source /opt/miniconda/etc/profile.d/conda.sh && conda activate myenv && python manage.py runserver 0.0.0.0:8000"]
