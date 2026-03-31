import sys
import traceback

with open("test2_out.txt", "w") as f:
    try:
        import main
        f.write("SUCCESS\n")
    except Exception as e:
        f.write(traceback.format_exc())
