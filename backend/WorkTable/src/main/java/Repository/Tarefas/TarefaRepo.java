package Repository.Tarefas;

import ConnectionFactory.ConnectionFactory;
import Model.Tarefa;

import java.sql.*;


public class TarefaRepo {


    public int deleteTarefa(Long idUser, Long idTarefa) {
        String sql = "DELETE FROM TAREFA WHERE ID=? AND ID_USER=?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, idUser);
            stmt.setLong(2, idTarefa);

            int deleteConfirmed = stmt.executeUpdate();
            if (deleteConfirmed > 0) {
                System.out.println("Confirmado.");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return 0;
    }

    public boolean updateNomeTarefaById(Long id, String novoNome) {

        String sql = "UPDATE TAREFAS SET NOME=? WHERE ID=?";

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, novoNome);
            stmt.setLong(2, id);

            int linhasAlteradas = stmt.executeUpdate();

            return linhasAlteradas > 0;

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Tarefa createTarefa(Tarefa tarefa) throws SQLException {

        String sql="INSERT INTO TAREFAS (NOME,NOTES) VALUE(?,?)";

        try(Connection conn=ConnectionFactory.getConnection();
        PreparedStatement stmt= conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)){

            stmt.setString(1, tarefa.getNome());
            stmt.setString(2, tarefa.getNotes());

            int i= stmt.executeUpdate();
            if (i == 0) {
                throw new SQLException("Falha ao criar a tarefa.");
            }
            try(ResultSet rs= stmt.getGeneratedKeys()){
                if(rs.next()){
                    tarefa.setId(rs.getLong(1));
                    return tarefa;
                }
                throw new SQLException("ID não foi gerado.");
            }
        }
    }
}
