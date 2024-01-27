import os

def modify_env_variable(env_file_path, variable_name):
    # Ask the user for the new value
    new_value = input(f"Enter new value for {variable_name}: ")

    # Check if the .env file exists
    if not os.path.exists(env_file_path):
        print(f"The file {env_file_path} does not exist.")
        return

    # Read the content of the .env file
    with open(env_file_path, 'r') as file:
        lines = file.readlines()

    # Modify the specified environment variable
    with open(env_file_path, 'w') as file:
        variable_found = False
        for line in lines:
            if line.startswith(variable_name + '='):
                file.write(f"{variable_name}={new_value}\n")
                variable_found = True
            else:
                file.write(line)
        
        if not variable_found:
            file.write(f"{variable_name}={new_value}\n")

# Usage
env_file_path = 'backend/.env'
variable_name = 'FORTYTWO_CLIENT_SECRET'
modify_env_variable(env_file_path, variable_name)
