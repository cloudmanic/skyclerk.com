# Skyclerk

This is the public website for https://skyclerk.com

# Install Gulp

`npm install --global gulp-cli`

`npm install`


# Deploying Servers

* When deploying a server with Digital Ocean copy the following into the `User-Data` filed. It will run Cloud Init when the VPS boots up.

```
#cloud-config
users:
  - name: spicer
    groups: sudo
    shell: /bin/bash
    sudo: ['ALL=(ALL) NOPASSWD:ALL']
    ssh-authorized-keys:
      - ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAsw21gLc2CaJN8hJB7zWDYWLF5gqWl6t8ozgso8aOrq8rz7P8ji3MwvHEelEe6UMNg4CxWTGYIWvFptlfCRvy9d94RBy9AAdb4pEBmSOyxPf8sJ+xD+V3TFJfmMOAm4049cBLN9b7+PRkUjl4jC3zTch5tQ+5lG7v04tWwzCaSCSD2HNuw2qKK3FpaLA6EIw+ieueBkgNgRnwMvgVO8nmyOkR5b3WUoL4vow3heNHV00V4M0yhBHLHDIFkXMgMztpLm3Dki1ZplUF0EyPH5llj5a4n2RMR5c7B1wAiXuUPO0oQTw9ItS5SZl9zKu9ZuIvqeXWsz/0NqRdEMIKqvxIZQ== spicer@cloudmanic.com
packages:
  - python
```

* Once a fresh server is up and running configure it with `ansible-playbook server-config.yml`
