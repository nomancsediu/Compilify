from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .lexer import Lexer

@csrf_exempt
@api_view(['POST'])
def lexical_analysis(request):
    try:
        import json
        if hasattr(request, 'data'):
            code = request.data.get('code', '')
        else:
            data = json.loads(request.body)
            code = data.get('code', '')
            
        lexer = Lexer()
        tokens = lexer.tokenize(code)
        
        return Response({
            'success': True,
            'tokens': tokens
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        })











