# Event Mapping
Cloud to Street Flood Event Mapping Practical Exercise

## Running

On Windows, recommend developing under [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

Set up project by running the following commands.

```sh
# Enter the Django folder.
cd flood_viewer_project

# Install the virtualenv Python module using Pip. Pip is included with Python since Python 3.4.
python -m pip install virtualenv

# Create a virtual environment.
python -m virtualenv venv

# Enter the virtual environment. Confused by Python's virtual environments? See https://docs.python.org/3/tutorial/venv.html
source venv/bin/activate

# Install the required Python packages.
python -m pip install -r requirements.txt

# Create or update the database. (manage.py is a script provided by Django for administrative commands.)
python manage.py migrate

# Add an administrator account. Username: admin, password: admin.
python manage.py shell -c "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'admin')"

# Run the Django server. Leave the server running as you complete your exercise.
python -m manage runserver

# In another terminal, navigate to the angular-frontend/ subdirectory.
cd fullstack-flood-event-display/angular-frontend

# Install the Node package dependencies with npm install.
npm install

# also need the Angular command line tools.
npm install -g @angular/cli

# Now run the frontend webserver. Leave the server running.
ng serve
```

Frontend dashboard at http://localhost:4200.

![Image of what the frontend should look like when it is first loaded.](./screenshot-frontend.png)

An interface to the Django backend at http://localhost:8000/. 

The administrator username and password are both `admin`. Once logged in, it should look like this. 

![Image of what the backend Django admin page should look like when it is first loaded.](./screenshot-backend.png)

It can create, view, update, and delete database entries at here.

## Project structure

```
.
|   * You're reading this file.
├── README.md
|
|   * The frontend Angular project.
├── angular-frontend
│   └── src
|       |
|       |   * The directory containing the all the UI components.
|       |   * This is where you'll write your frontend code.
│       ├── app
|       |   |
|       |   |   * The autocomplete search box component.
│       |   ├── autocomplete
|       |   |
|       |   |   * The map component.
│       |   ├── map
│       |   |   |
│       |   |   |   * The HTML template for the map.
│       |   |   ├── map.component.html
│       |   |   |
│       |   |   |   * The TypeScript code that controls the component.
│       |   |   ├── map.component.ts
│       |   |   |
│       |   |   |   * The stylesheet for the component.
│       |   |   └── map.component.css
│       |   |
│       |   |   * The main HTML template for the page. Contains the map and
│       |   |   * search box.
│       |   ├── app.component.html
│       |   |
│       |   |   * The TypeScript code that controls the component.
│       |   ├── app.component.ts
│       |   |
│       |   |   * A collection of functions for querying the backend.
│       |   └── django-api.service.ts
│       |
│       ├── index.html
│       ├── main.ts
│       └── styles.css
|
|   * The backend Django project.
└── flood_viewer_project
    |
    |   * The database.
    ├── db.sqlite3
    |
    |   * The project configuration folder. Here's where you add routes and
    |   * change settings.
    ├── flood_viewer
    |   |
    |   |   * Settings that apply to the whole Django project.
    │   ├── settings.py
    |   |
    |   |   * The file that associates URLs with views.
    │   └── urls.py
    |
    |   * The Django app folder. Here's where you'll define your models and
    |   * endpoints.
    ├── flood_viewer_app
    |   |
    |   |   * The admin site configuration. This is how you configure the
    |   |   * database admin interface at localhost:8000/admin.
    │   ├── admin.py
    |   |
    |   |   * The dataset describing the regions of Ghana.
    │   ├── ghana_geometry.py
    |   |
    |   |   * The database models.
    │   ├── models.py
    |   |
    |   |   * The endpoints that respond to HTTP requests for a given URL.
    │   └── views.py
    |
    |   * The script used for running administrative Django commands.
    └── manage.py
```
