package org.example.worktable.repository.tarefas;



import org.example.connection.ConnectionFactory;
import org.example.worktable.model.Tarefa;
import org.springframework.stereotype.Repository;

import java.sql.*;

@Repository
public class TarefaRepo {


    public int deleteTarefa(Long idUser, Long idTarefa) {
        // Correção: unificar nome da tabela para TAREFAS (plural) para consistência com UPDATE e INSERT
        String sql = "DELETE FROM TAREFAS WHERE ID=? AND ID_USER=?";

        // Correção: declarar deleteConfirmed fora do try para estar no escopo do return
        int deleteConfirmed = 0;
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            // Correção: parâmetros estavam trocados (idUser em ID, idTarefa em ID_USER)
            stmt.setLong(1, idTarefa);
            stmt.setLong(2, idUser);

            deleteConfirmed = stmt.executeUpdate();
            if (deleteConfirmed > 0) {
                System.out.println("Confirmado.");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        // Correção: retornar deleteConfirmed em vez de 0 (sempre retornava 0 mesmo após deletar)
        return deleteConfirmed;
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

        // Correção: VALUE deve ser VALUES (plural) conforme sintaxe SQL padrão
        String sql="INSERT INTO TAREFAS (NOME,NOTES) VALUES(?,?)";

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
