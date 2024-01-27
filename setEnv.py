import re

def switch_ip_address():
    # Define the predefined IP address options
    ip_options = ["192.168.1.88", "gogo.software", "Custom IP"]

    # Paths to the .env files
    frontend_env_path = "./frontend/.env"
    backend_env_path = "./backend/.env"

    # Ask the user to choose the IP address
    print("Choose the IP address:")
    for i, ip in enumerate(ip_options, start=1):
        print(f"{i}. {ip}")

    choice = input("Enter your choice (1, 2, or 3 for custom): ")

    try:
        # Validate and process the user's choice
        choice = int(choice)
        if choice not in [1, 2, 3]:
            raise ValueError

        if choice == 3:
            selected_ip = input("Enter the custom IP address: ")
        else:
            selected_ip = ip_options[choice - 1]

        # Update the IP address in the frontend .env file
        update_env_file(frontend_env_path, selected_ip)

        # Update the IP address and DB_HOST in the backend .env file
        db_host_value = "${IP_ADDRESS} " if selected_ip == "192.168.1.88" else "postgres_db"
        update_env_file(backend_env_path, selected_ip, db_host_value)

        print("IP_ADDRESS updated successfully in both .env files.")

    except ValueError:
        print("Invalid choice. Please run the script again and enter a valid number.")

def update_env_file(env_path, ip_address, db_host=None):
    # Read the current contents of the .env file
    with open(env_path, "r") as file:
        contents = file.readlines()

    # Update the IP address in the .env file
    new_contents = []
    ip_pattern = re.compile(r"^IP_ADDRESS=.*$")
    db_host_pattern = re.compile(r"^DB_HOST=.*$") if db_host else None

    for line in contents:
        if ip_pattern.match(line):
            new_contents.append(f"IP_ADDRESS={ip_address}\n")
        elif db_host_pattern and db_host_pattern.match(line):
            new_contents.append(f"DB_HOST={db_host}\n")
        else:
            new_contents.append(line)

    # Write the updated contents back to the .env file
    with open(env_path, "w") as file:
        file.writelines(new_contents)

# Run the script
switch_ip_address()
