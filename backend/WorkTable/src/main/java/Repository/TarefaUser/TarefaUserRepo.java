package Repository.TarefaUser;

import ConnectionFactory.ConnectionFactory;
import Model.Tarefa;
import Model.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class TarefaUserRepo {

    public List<User> findUsersByTarefa(Tarefa tarefa) throws SQLException {

        List<User>listaDeUsuariosDaTarefaEspecifica=new ArrayList<>();

        String sql = "SELECT U.ID, U.FIRST_NAME,U.LAST_NAME, U.EMAIL FROM USUARIOS U "
                + "JOIN TAREFA_USUARIO TU ON TU.ID_USUARIO = U.ID "
                + "WHERE TU.ID_TAREFA = ?";

        try(Connection conn= ConnectionFactory.getConnection();
            PreparedStatement stmt=conn.prepareStatement(sql)){

            stmt.setLong(1,tarefa.getId());

            try(ResultSet rs= stmt.executeQuery()){
                while(rs.next()){
                    Long id=rs.getLong("ID");
                    String FirstName=rs.getString("FIRST_NAME");
                    String LastName=rs.getString("LAST_NAME");
                    String email=rs.getString("email");

                    listaDeUsuariosDaTarefaEspecifica.add(User.builder()
                            .id(id).FirtsName(FirstName).Lastname(LastName).email(email).build());

                }
            }
            return listaDeUsuariosDaTarefaEspecifica;
        }
    }

    public int insertGroupForTarefa(Tarefa tarefa,List<User> users) throws SQLException {
        Objects.requireNonNull(tarefa, "Tarefa nao pode ser nula");
        Objects.requireNonNull(users, "Usuario nao pode ser nula");
        int linhasAfetadas=0;
        String sql = "INSERT INTO TAREFA_USER (ID_USER,ID_TAREFA) VALUES(?,?)";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            for (User user : users) {
                stmt.setLong(1, user.getId());
                stmt.setLong(2, tarefa.getId());
                 linhasAfetadas = stmt.executeUpdate();

                if (linhasAfetadas == 0) {
                    System.out.println("Erro: associação não criada para o usuário "
                            + user.getId());
                }
            }
        }
        return linhasAfetadas;
    }
    public List<Tarefa> findTarefasByUsersId(Long id) throws SQLException {

        List<Tarefa>tarefasDoUsuario=new ArrayList<>();

        String sql="SELECT T.* FROM TAREFAS T JOIN TAREFA_USUARIO TU ON TU.ID = T.ID WHERE TU.ID_USUARIO=?";

        try(Connection conn=ConnectionFactory.getConnection();
            PreparedStatement stmt=conn.prepareStatement(sql)){

            stmt.setLong(1,id);
            try(ResultSet rs= stmt.executeQuery()){
                while(rs.next()){
                    String nome = rs.getString("NOME");
                    String notes=rs.getString("NOTES");
                    Boolean conc=rs.getBoolean("CONCLUIDO");
                    Date date=rs.getDate("DATA");

                    Tarefa tarefasDoUser=new Tarefa.builderTarefa()
                            .IdUser(id)
                            .nome(nome)
                            .notes(notes)
                            .build();

                    tarefasDoUsuario.add(tarefasDoUser);
                }

            }
        }
        return tarefasDoUsuario;
    }

    public int deleteUserFromTarefaById(Long userId,Long tarefaId) throws SQLException {
        if(userId==null || tarefaId==null ){
            throw new IllegalArgumentException("Id nao informado");
        }
        int i=0;
        String sql= " DELETE FROM TAREFA_USER WHERE USER_ID=? AND TAREFA_ID=?";

        try(Connection conn=ConnectionFactory.getConnection();
        PreparedStatement stmt=conn.prepareStatement(sql)){

            stmt.setLong(1,userId);
            stmt.setLong(2,tarefaId);

            i=stmt.executeUpdate();

            if(i==0){
                throw new Error("Nao houve remocao do usuario");
            }
        }
        return i;
    }
}
