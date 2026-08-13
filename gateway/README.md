# Gateway for E-commerce

Route incoming traffic, handle SSL termination, rate limiting, request validation, and API aggregation.

@author: Shivam Kumar Giri [@S21hivamgiri](https://github.com/S21hivamgiri)
@email: <shivamagiri2015@gmail.com>

Used **Node.js ESModule** for Gatwway implementation as it wins real time and input output heavy APIs.

```bash
#command to run gateway
bazel run //gateway:gateway                              #Linux
bazel --bazelrc=.bazelrc.windows run //gateway:gateway   #Windows

#command to build gateway
bazel build //gateway:gateway                            #Linux                     
bazel --bazelrc=.bazelrc.windows build //gateway:gateway #Windows

#execute the local gateway unit test cases
bazel test //gateway:tests                               #Linux
bazel --bazelrc=.bazelrc.windows  test //gateway:tests   #Windows
```

See local host :

## Server

**[http:localhost:8080](http:localhost:8080)**

## Healthcheck

**[http:localhost:8080/health](http:localhost:8080/health)**

## Functional Requirements

---TODO--

## Non Functional Requirements

---TODO--
