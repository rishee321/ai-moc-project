import json
import subprocess
import tempfile
import os
import time


TIMEOUT_SECONDS = 5


def execute_python_code(code: str, test_cases: str):

    # -------------------------------
    # Parse test cases
    # -------------------------------

    try:
        cases = json.loads(test_cases)

    except (json.JSONDecodeError, TypeError):

        return {
            "status": "Invalid Test Cases",
            "passed_test_cases": 0,
            "total_test_cases": 0,
            "execution_time": 0,
            "score": 0,
            "error_message": "Invalid test case format"
        }

    if not isinstance(cases, list):

        return {
            "status": "Invalid Test Cases",
            "passed_test_cases": 0,
            "total_test_cases": 0,
            "execution_time": 0,
            "score": 0,
            "error_message": "Test cases must be a list"
        }

    # -------------------------------
    # Variables
    # -------------------------------

    passed = 0
    total = len(cases)
    total_time = 0
    last_error = None

    # -------------------------------
    # Run every test case
    # -------------------------------

    for test_case in cases:

        test_input = str(
            test_case.get("input", "")
        )

        expected_output = str(
            test_case.get("expected_output", "")
        ).strip()

        with tempfile.TemporaryDirectory() as temp_dir:

            code_file = os.path.join(
                temp_dir,
                "solution.py"
            )

            with open(
                code_file,
                "w",
                encoding="utf-8"
            ) as file:

                file.write(code)

            command = [
                "docker",
                "run",
                "--rm",
                "--network",
                "none",
                "--memory",
                "128m",
                "--cpus",
                "0.5",
                "-i",
                "-v",
                f"{temp_dir}:/code:ro",
                "python:3.12-slim",
                "python",
                "/code/solution.py"
            ]

            start_time = time.perf_counter()

            try:

                result = subprocess.run(
                    command,
                    input=test_input,
                    text=True,
                    capture_output=True,
                    timeout=TIMEOUT_SECONDS
                )

                execution_time = (
                    time.perf_counter() - start_time
                )

                total_time += execution_time

                actual_output = (
                    result.stdout.strip()
                )

                # Runtime error
                if result.returncode != 0:

                    last_error = (
                        result.stderr.strip()
                        or "Runtime error"
                    )

                    continue

                # Correct answer
                if actual_output == expected_output:

                    passed += 1

                else:

                    last_error = (
                        f"Expected: {expected_output}, "
                        f"Got: {actual_output}"
                    )

            except subprocess.TimeoutExpired:

                last_error = "Execution timed out"

    # -------------------------------
    # Calculate result
    # -------------------------------

    if total == 0:

        status = "No Test Cases"

        score = 0

    elif passed == total:

        status = "Accepted"

        score = 100

    elif passed > 0:

        status = "Partially Accepted"

        score = round(
            (passed / total) * 100,
            2
        )

    else:

        status = "Wrong Answer"

        score = 0

    # -------------------------------
    # Return result
    # -------------------------------

    return {
        "status": status,
        "passed_test_cases": passed,
        "total_test_cases": total,
        "execution_time": round(
            total_time,
            4
        ),
        "score": score,
        "error_message": last_error
    }