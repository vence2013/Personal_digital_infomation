# 创建证书
[使用openssl和nodejs搭建本地https服务](https://www.cnblogs.com/zzmiaow/p/10201035.html)

1. 生成私钥
~~~
openssl genrsa -out ca-key.pem -des 2048
~~~
2. 生成公钥
~~~
openssl req -new -key ca-key.pem -out ca-csr.pem
~~~
3. 生成证书
~~~
openssl x509 -req -in ca-csr.pem -signkey ca-key.pem -out ca-cert.pem
~~~

4. 生成服务器端数据
~~~
openssl genrsa -out server-key.pem 2048
openssl req -new -key server-key.pem -config openssl.cnf -out server-csr.pem
openssl x509 -req -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -in server-csr.pem -out server-cert.pem -extensions v3_req -extfile openssl.cnf
~~~