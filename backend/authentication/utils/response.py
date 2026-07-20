from rest_framework.response import Response
from rest_framework import status


def success_response(message="Success", data=None, status_code=status.HTTP_200_OK):
    """
    Format standard API success response:
    {
        "success": True,
        "message": "...",
        "data": {...}
    }
    """
    if data is None:
        data = {}
    return Response(
        {
            "success": True,
            "message": message,
            "data": data
        },
        status=status_code
    )


def error_response(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Format standard API error response:
    {
        "success": False,
        "message": "...",
        "errors": {...}
    }
    """
    if errors is None:
        errors = {}
    return Response(
        {
            "success": False,
            "message": message,
            "errors": errors
        },
        status=status_code
    )
