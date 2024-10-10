from django.shortcuts import render
from django.http import HttpRequest, JsonResponse, HttpResponse
from rest_framework.views import APIView
from django.utils.decorators import method_decorator
from supertokens_python.recipe.multitenancy.syncio import list_all_tenants
from supertokens_python.recipe.session.framework.django.syncio import verify_session
from .models import Dashboard, Tile, User, Organization
from rest_framework import status
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .models import User, Organization, OrgTables
from .serializer import DashboardSerializer, TileSerializer, UserSerializer, OrganizationSerializer
from .models import User, UserAccessPermissions
from .helpers.table_preprocessing import get_database_schemas_and_tables, process_table
import concurrent.futures


from .serializer import UserPermissionsSerializer


class SessionInfoAPI(APIView):
    @method_decorator(verify_session())
    def get(self, request, format=None):
        session_ = request.supertokens
        return JsonResponse(
            {
                "sessionHandle": session_.get_handle(),
                "userId": session_.get_user_id(),
                "accessTokenPayload": session_.get_access_token_payload(),
            }
        )


class TenantsAPI(APIView):
    def get(self, request, format=None):
        tenantReponse = list_all_tenants()

        tenantsList = []

        for tenant in tenantReponse.tenants:
            tenantsList.append(tenant.to_json())

        return JsonResponse({
            "status": "OK",
            "tenants": tenantsList,
        })


@api_view(["GET"])
def health_check(request):
    return JsonResponse({'message': 'Server is running successfully'}, status=200)


@api_view(["POST"])
def create_user(request):
    try:
        print(request.data)
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            print(serializer)
            serializer.save()
            return JsonResponse(
                {'message': 'User created successfully', 'user': serializer.data}, status=status.HTTP_201_CREATED
            )
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET", "PATCH", "DELETE"])
def user_details(request, user_id):
    try:
        user = User.objects.get(id=user_id)

        if request.method == "GET":
            serializer = UserSerializer(user)
            return JsonResponse({'message': 'User retrieved successfully', 'user': serializer.data}, status=200)

        elif request.method == "PATCH":
            serializer = UserSerializer(
                instance=user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(
                    {'message': 'User updated successfully', 'user': serializer.data}, status=status.HTTP_200_OK
                )
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "DELETE":
            user.delete()
            return JsonResponse({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return JsonResponse({'error': f'No user with id:{user_id} exists'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@verify_session()
def create_dashboard(request):
    try:
        user_id = request.supertokens.get_user_id()
        print(user_id)
        user = get_object_or_404(User, id=user_id)
        org_id = user.organization.id
        request.data['organization'] = org_id
        request.data['created_by'] = user.first_name + " " + user.last_name
        request.data['dash_id'] = 'DASH010'
        print(request.data)
        serializer = DashboardSerializer(data=request.data)
        if serializer.is_valid():
            dashboard = serializer.save()
            print(dashboard)
            return JsonResponse(
                {'message': 'Dashboard created successfully',
                    'dashboard': serializer.data},
                status=status.HTTP_201_CREATED
            )
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def create_organization(request):
    try:
        print(f"Raw Request Data: {request.body}")
        print(f"Parsed Request Data: {request.data}")
        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            organization = serializer.save()
            return JsonResponse(
                {'message': 'Organization created successfully',
                    'organization': serializer.data},
                status=status.HTTP_201_CREATED
            )
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET", "PATCH", "DELETE"])
def organization_details(request, org_id):
    try:
        organization = Organization.objects.get(id=org_id)

        if request.method == "GET":
            serializer = OrganizationSerializer(organization)
            return JsonResponse(
                {'message': 'Organization retrieved successfully', 'organization': serializer.data}, status=200
            )

        elif request.method == "PATCH":
            serializer = OrganizationSerializer(
                instance=organization, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(
                    {'message': 'Organization updated successfully', 'organization': serializer.data}, status=200
                )
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "DELETE":
            # print(organization)
            organization.delete()
            return JsonResponse({'message': f'Organization with id:{org_id} deleted successfully'}, status=204)

    except Organization.DoesNotExist:
        return JsonResponse({'error': f'No organization with id:{org_id} exists'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_users_by_organization(request, org_id):
    try:
        organization = Organization.objects.get(id=org_id)
        users = User.objects.filter(organization=org_id)
        serializer = UserSerializer(users, many=True)
        return JsonResponse(
            {'message': 'Users retrieved successfully', 'users': serializer.data}, status=status.HTTP_200_OK
        )

    except Organization.DoesNotExist:
        return JsonResponse({'error': f'No organization with id:{org_id} exists'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def create_connection(request):
    try:
        uri = request.data.get('uri', None)
        db_type = request.data.get('db_type', None)
        user_id = request.data.get('user_id', None)
        if not uri or not user_id or not db_type:
            return JsonResponse({'error': "Both uri, org_id and db_type are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)
        organization = user.organization

        # update organization with uri
        organization.database_uri = uri
        organization.save()

        db_data = get_database_schemas_and_tables(uri, db_type)

        if not db_data:
            print("No data retrieved from the database.")
            return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        tasks = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            for schema_name, tables in db_data.items():
                for table_name, table_info in tables.items():
                    task = executor.submit(
                        process_table, schema_name, table_name, table_info, uri, organization)
                    tasks.append(task)

            for future in concurrent.futures.as_completed(tasks):
                org_table = future.result()
                org_table.save()
                add_permissions_to_user(user_id, org_table.id, 'Admin')

        return JsonResponse({'message': 'meta data created and saved'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def query_databases(request):
    text = request.data.get('text', None)
    org_id = request.data.get('org_id', None)
    user_id = request.data.get('user_id', None)

    if not text or not org_id or not user_id:
        return JsonResponse({'error': "Text, user_id and org_id are required"}, status=status.HTTP_400_BAD_REQUEST)

    # TODO: implement text to sql, execute sql, return ans
    # TODO: use websockets to stream the data to user
    # TODO: store history of the user's NLP and generated sql query
    return JsonResponse({'message': 'data generated!'}, status=200)


def add_permissions_to_user(user_id, table_id, permission):
    """
    Utility function to add permissions for a user to a specific table.
    """
    if UserAccessPermissions.objects.filter(user_id=user_id, table_id=table_id, permission=permission).exists():
        return {'error': 'Permission already exists for this user and table'}, status.HTTP_409_CONFLICT

    data = {
        'user_id': user_id,
        'table_id': table_id,
        'permission': permission
    }
    serializer = UserPermissionsSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        # If 'Admin' permission is requested, 'View' permission will also be granted (if not already granted)
        if (permission == 'Admin' and
                not UserAccessPermissions.objects.filter(user_id=user_id, table_id=table_id,
                                                         permission='View').exists()):
            add_permissions_to_user(user_id, table_id, 'View')
        return {'message': 'User permissions added successfully'}, status.HTTP_201_CREATED
    else:
        return serializer.errors, status.HTTP_400_BAD_REQUEST


@api_view(["GET"])
@verify_session()
def get_dashboards(request: HttpRequest):
    session = request.supertokens
    user_id = session.get_user_id()
    print(user_id)
    user = get_object_or_404(User, id=user_id)
    org_id = user.organization
    dashboards = Dashboard.objects.filter(organization=org_id)
    serializer = DashboardSerializer(dashboards, many=True)
    return JsonResponse({'data': serializer.data}, status=200)


@api_view(["GET"])
@verify_session()
def get_dashboard_tiles(request: HttpRequest):
    print("get tiles request called")
    user_id = request.supertokens.get_user_id()
    dash_id = request.GET.get('dash_id', None)
    user = get_object_or_404(User, id=user_id)
    org_id = user.organization.id
    print("dash_id: ", dash_id)
    tiles = Tile.objects.filter(dash_id=dash_id, organization=org_id)
    print("filtered tiles: ", tiles)
    serializer = TileSerializer(tiles, many=True)
    print("data", serializer.data)
    return JsonResponse({'data': serializer.data}, status=200)


@api_view(["POST"])
@verify_session()
def create_dashboard_tile(request: HttpRequest):
    try:
        dash_id = request.data.get('dash_id', None)
        print(dash_id)
        if not dash_id:
            return JsonResponse({'error': "Dash_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        user_id = request.supertokens.get_user_id()
        user = get_object_or_404(User, id=user_id)
        org_id = user.organization.id
        request.data['organization'] = org_id
        request.data['sql_query'] = ''
        request.data['component'] = 'LineChartTemplate'
        request.data['tile_props'] = {
            'series': [
                {
                    "name": "Desktops",
                    "data": [10, 41, 35, 51, 49, 62, 69, 91, 148],
                },
            ],
            'title': request.data.get('title', 'Untitled'),
            'categories': ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
        }
        print(request.data)
        serializer = TileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({'data': serializer.data}, status=201)
        print(serializer.errors)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
