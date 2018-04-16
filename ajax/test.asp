<%@LANGUAGE="VBSCRIPT" CODEPAGE="936"%>
<%
Response.CodePage=936
Response.Charset="gb2312"

dim conn,connstr
connstr="Provider=Microsoft.ACE.OLEDB.12.0;Data Source="+server.mappath("test.accdb")
set conn=server.createobject("ADODB.CONNECTION")
conn.open connstr

dim rs,sql,key,count,items
set rs=server.createobject("adodb.recordset")
sql="select country from t_country"

count=request("count")
if not isnull(count) and trim(count)<>"" then
	count = cint(count)
	if count>0 then
		sql="select top "&count&" country from t_country"
	end if
end if

key=request("search")
if not isnull(key) and trim(key)<>"" then
	sql=sql&" where country like '%"&trim(key)&"%'"
end if
sql=sql&" order by country"
rs.open sql,conn,1,1

items="["
do while not rs.eof
	items=items&""""&replace(rs("country"),"""","\""")&""","
	rs.movenext
loop
if len(items)>1 then
	items=left(items,len(items)-1)
end if
items=items&"]"

response.write(items)
response.End()

rs.close
conn.close
set conn=nothing
%>