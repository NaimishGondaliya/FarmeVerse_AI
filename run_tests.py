import subprocess
with open('test_utf8.txt', 'w', encoding='utf-8') as f:
    res = subprocess.run(['python', 'backend/manage.py', 'test', 'expert'], capture_output=True, text=True)
    f.write("STDOUT:\n")
    f.write(res.stdout)
    f.write("\nSTDERR:\n")
    f.write(res.stderr)
