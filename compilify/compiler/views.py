from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .lexer import Lexer
from .parser import Parser
from .semantic_analyzer import SemanticAnalyzer

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

@csrf_exempt
@api_view(['POST'])
def syntax_analysis(request):
    try:
        import json
        if hasattr(request, 'data'):
            code = request.data.get('code', '')
        else:
            data = json.loads(request.body)
            code = data.get('code', '')
            
        parser = Parser()
        ast = parser.parse(code)
        
        return Response({
            'success': True,
            'ast': ast
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        })



@csrf_exempt
@api_view(['POST'])
def semantic_analysis(request):
    try:
        import json
        if hasattr(request, 'data'):
            code = request.data.get('code', '')
        else:
            data = json.loads(request.body)
            code = data.get('code', '')
            
        if not code.strip():
            return Response({
                'success': False,
                'error': 'No code provided'
            })
            
        parser = Parser()
        ast = parser.parse(code)
        
        analyzer = SemanticAnalyzer()
        result = analyzer.analyze(ast)
        
        return Response(result)
    except Exception as e:
        import traceback
        return Response({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        })





