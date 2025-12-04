from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .lexer import Lexer
from .parser import Parser
from .evaluator import Evaluator
from .semantic_analyzer import SemanticAnalyzer
from .intermediate_generator import IntermediateGenerator
from .optimizer import Optimizer
from .code_generator import CodeGenerator

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
def evaluate_code(request):
    try:
        import json
        if hasattr(request, 'data'):
            code = request.data.get('code', '')
        else:
            data = json.loads(request.body)
            code = data.get('code', '')
            
        evaluator = Evaluator()
        result = evaluator.evaluate(code)
        
        return Response(result)
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

@csrf_exempt
@api_view(['POST'])
def intermediate_generation(request):
    try:
        import json
        if hasattr(request, 'data'):
            code = request.data.get('code', '')
        else:
            data = json.loads(request.body)
            code = data.get('code', '')
            
        parser = Parser()
        ast = parser.parse(code)
        
        generator = IntermediateGenerator()
        result = generator.generate(ast)
        
        return Response(result)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
@api_view(['POST'])
def optimization(request):
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
        
        generator = IntermediateGenerator()
        intermediate = generator.generate(ast)
        
        if intermediate.get('success'):
            optimizer = Optimizer()
            result = optimizer.optimize(intermediate['intermediate_code'])
            return Response(result)
        else:
            return Response(intermediate)
    except Exception as e:
        import traceback
        return Response({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        })

@csrf_exempt
@api_view(['POST'])
def code_generation(request):
    try:
        import json
        if hasattr(request, 'data'):
            code = request.data.get('code', '')
            target = request.data.get('target', '8086')
        else:
            data = json.loads(request.body)
            code = data.get('code', '')
            target = data.get('target', '8086')
            
        parser = Parser()
        ast = parser.parse(code)
        
        generator = IntermediateGenerator()
        intermediate = generator.generate(ast)
        
        if intermediate['success']:
            optimizer = Optimizer()
            optimized = optimizer.optimize(intermediate['intermediate_code'])
            
            if optimized['success']:
                code_gen = CodeGenerator(target)
                result = code_gen.generate(optimized['optimized_code'])
                return Response(result)
            else:
                return Response(optimized)
        else:
            return Response(intermediate)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        })