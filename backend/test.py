import traceback
try:
    import main
    print("SUCCESS")
except Exception as e:
    with open("error_output.txt", "w") as f:
        traceback.print_exc(file=f)
